"use client";

import {useState, useEffect, useCallback} from "react";
import {VaccinationRecordForm} from "@/components/VaccinationRecordForm";
import {VaccinationScheduleEntry, getVaccinationScheduleForAge} from "@/services/vaccination-schedule";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {format, differenceInMonths} from "date-fns";
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Edit, Trash, UserPlus} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {z} from "zod";
import {toast} from "@/hooks/use-toast";
import {Input} from "@/components/ui/input";
import {Calendar} from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import VaccinationStatusDisplay from "@/components/VaccinationStatusDisplay";

interface VaccinationRecord {
    vaccineName: string;
    date: Date;
    batchNumber?: string;
    notes?: string;
    id: string;
    babyId: string;
}

interface BabyProfile {
    id: string;
    name: string;
    birthDate: Date;
}

const AddBabyFormSchema = z.object({
    name: z.string().min(2, {
        message: "Bebek adı en az 2 karakter olmalıdır.",
    }),
    birthDate: z.date({
        required_error: "Bir doğum tarihi gereklidir.",
    }),
})

interface AddBabyFormProps {
    onSubmit: (values: z.infer<typeof AddBabyFormSchema>) => void;
    initialValues?: Partial<z.infer<typeof AddBabyFormSchema>>;
}

function AddBabyForm({onSubmit, initialValues}: AddBabyFormProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof AddBabyFormSchema>>({
        resolver: zodResolver(AddBabyFormSchema),
        defaultValues: initialValues || {
            name: "",
            birthDate: new Date(),
        },
    })

    function handleBabySubmit(values: z.infer<typeof AddBabyFormSchema>) {
        onSubmit(values);
        form.reset();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBabySubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Bebek Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Bebek adını girin" {...field} />
                            </FormControl>
                            <FormDescription>
                                Bebeğin adını girin.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({field}) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Doğum Tarihi</FormLabel>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Bir tarih seçin</span>
                                            )}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date()
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Bebeğin doğum tarihini girin.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Kaydet</Button>
            </form>
        </Form>
    )
}


const VaccinationTimeline = () => {
    const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
    const [babyProfiles, setBabyProfiles] = useState<BabyProfile[]>([]);
    const [selectedBaby, setSelectedBaby] = useState<BabyProfile | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddBabyDialogOpen, setIsAddBabyDialogOpen] = useState(false);
    const [vaccinationSchedule, setVaccinationSchedule] = useState<VaccinationScheduleEntry[]>([]);
    const [isAddBabyFormOpen, setIsAddBabyFormOpen] = useState(false);
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        const storedBabyProfiles = localStorage.getItem('babyProfiles');
        if (storedBabyProfiles) {
            setBabyProfiles(JSON.parse(storedBabyProfiles).map((profile: any) => ({
                ...profile,
                birthDate: new Date(profile.birthDate),
            })));
           
        } else {
            setBabyProfiles([]);

        }
    }, []);

    useEffect(() => {
         if (babyProfiles.length > 0) {
             localStorage.setItem('babyProfiles', JSON.stringify(babyProfiles));
         }
    }, [babyProfiles]);

    useEffect(() => {
        if (selectedBaby) {
            const storedVaccinationRecords = localStorage.getItem(`vaccinationRecords-${selectedBaby.id}`);
            if (storedVaccinationRecords) {
                setVaccinationRecords(JSON.parse(storedVaccinationRecords).map((record: any) => ({
                    ...record,
                    date: new Date(record.date),
                })));
            } else {
                setVaccinationRecords([]);
            }
        } else {
            setVaccinationRecords([]);
        }
    }, [selectedBaby]);

    useEffect(() => {
        if (selectedBaby) {
            localStorage.setItem(`vaccinationRecords-${selectedBaby.id}`, JSON.stringify(vaccinationRecords));
        }
    }, [vaccinationRecords, selectedBaby]);

    useEffect(() => {
        if (selectedBaby) {
            const ageInMonths = differenceInMonths(new Date(), selectedBaby.birthDate);
            getVaccinationScheduleForAge(ageInMonths)
                .then(schedule => setVaccinationSchedule(schedule))
                .catch(error => {
                    console.error("Aşılama takvimi alınamadı", error);
                    toast({
                        title: "Hata",
                        description: "Seçilen bebek için aşılama takvimi yüklenemedi.",
                        variant: "destructive",
                    });
                });
        } else {
            setVaccinationSchedule([]);
        }
    }, [selectedBaby]);

    const addVaccinationRecord = (record: Omit<VaccinationRecord, "id" | "babyId">) => {
        if (!selectedBaby) {
            toast({
                title: "Hata",
                description: "Lütfen önce bir bebek profili seçin.",
                variant: "destructive",
            });
            return;
        }
        const newRecord = {...record, id: Date.now().toString(), babyId: selectedBaby.id};
        setVaccinationRecords([...vaccinationRecords, newRecord]);
        toast({
            title: "Başarılı",
            description: "Kayıt başarıyla eklendi!",
        })
    };

    const editVaccinationRecord = (updatedRecord: VaccinationRecord) => {
        setVaccinationRecords(
            vaccinationRecords.map((record) =>
                record.id === updatedRecord.id ? updatedRecord : record
            )
        );
        setIsEditDialogOpen(false);
        toast({
            title: "Başarılı",
            description: "Kayıt başarıyla düzenlendi!",
        })
    };

    const deleteVaccinationRecord = (id: string) => {
        setVaccinationRecords(vaccinationRecords.filter((record) => record.id !== id));
        toast({
            title: "Başarılı",
            description: "Kayıt başarıyla silindi!",
        })
    };

    const handleEditClick = (record: VaccinationRecord) => {
        setSelectedRecord(record);
        setIsEditDialogOpen(true);
    };

    const handleAddBaby = (newBabyValues: z.infer<typeof AddBabyFormSchema>) => {
        const newBaby: BabyProfile = {
            id: Date.now().toString(),
            name: newBabyValues.name,
            birthDate: newBabyValues.birthDate,
        };
        setBabyProfiles([...babyProfiles, newBaby]);
        setIsAddBabyDialogOpen(false);
        setIsAddBabyFormOpen(false);
        toast({
            title: "Başarılı",
            description: "Bebek profili başarıyla oluşturuldu!",
        })
          setSelectedBaby(newBaby);
    };

    const handleSelectBaby = (babyId: string) => {
        const baby = babyProfiles.find(profile => profile.id === babyId);
        setSelectedBaby(baby || null);
        setShowStatus(false); // Hide the status when a new baby is selected
    };

    const ageInMonths = selectedBaby ? differenceInMonths(new Date(), selectedBaby.birthDate) : 0;

    const calculateOverdueVaccinations = useCallback(() => {
        if (!selectedBaby) return [];

        const potentialVaccinations = vaccinationSchedule.filter(entry =>
            ageInMonths > entry.maxAgeMonths
        );

        return potentialVaccinations.filter(vaccination => {
            return !vaccinationRecords.find(record =>
                record.vaccineName === vaccination.vaccineName && record.babyId === selectedBaby.id
            );
        });
    }, [vaccinationSchedule, vaccinationRecords, selectedBaby, ageInMonths]);

    const calculateUpcomingVaccinations = useCallback(() => {
        if (!selectedBaby) return [];

        const futureVaccinations = vaccinationSchedule.filter(entry =>
            ageInMonths < entry.minAgeMonths
        );

        return futureVaccinations.filter(vaccination => {
            return !vaccinationRecords.find(record =>
                record.vaccineName === vaccination.vaccineName && record.babyId === selectedBaby.id
            );
        });
    }, [vaccinationSchedule, vaccinationRecords, selectedBaby, ageInMonths]);

    const overdueVaccinationsList = calculateOverdueVaccinations();
    const upcomingVaccinationsList = calculateUpcomingVaccinations();

    // State to manage visibility of the vaccination status
    const [statusVisible, setStatusVisible] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (showStatus) {
            setStatusVisible(true);
            timeoutId = setTimeout(() => {
                setStatusVisible(false);
                setShowStatus(false);
            }, 5000); // 5 seconds
        }

        return () => clearTimeout(timeoutId); // Clear timeout on unmount or update
    }, [showStatus]);

    const toggleStatusVisibility = () => {
        setShowStatus(true);
    };

    return (
        (
        <div className="flex flex-col md:flex-row min-h-screen bg-background">
            <div className="w-full md:w-2/3 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Aşılama Takvimi</CardTitle>
                            <CardDescription>
                                {selectedBaby ?
                                    `${selectedBaby.name} adlı bebeğin (${format(selectedBaby.birthDate, "PPP")} tarihinde doğdu) kaydedilen aşılarının listesi` :
                                    "Bebek seçilmedi. Lütfen bir bebek profili ekleyin."}
                            </CardDescription>
                        </div>
                        <div>
                            <Dialog open={isAddBabyDialogOpen} onOpenChange={setIsAddBabyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <UserPlus className="mr-2 h-4 w-4"/>
                                        Bebek Ekle
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Yeni Bebek Profili Ekle</DialogTitle>
                                        <DialogDescription>
                                            Aşıları takip etmek için yeni bir bebek profili oluşturun.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddBabyForm onSubmit={handleAddBaby}/>
                                </DialogContent>
                            </Dialog>
                            <Select
                                onValueChange={(value) => handleSelectBaby(value)}
                                value={selectedBaby?.id || ""}
                                defaultValue={selectedBaby?.id || ""}
                                placeholder="Bebek Seç"
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Bebek Seç"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {babyProfiles.map((baby) => (
                                        <SelectItem key={baby.id} value={baby.id}>
                                            {baby.name} ({format(baby.birthDate, "PPP")} tarihinde doğdu)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button onClick={toggleStatusVisibility}>Aşı Durumunu Göster</Button>
                        </div>
                    </CardHeader>

                    {statusVisible && selectedBaby && (
                        <CardContent>
                            {overdueVaccinationsList.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-red-500 font-semibold">Gecikmiş Aşılar:</h3>
                                    <ul className="list-disc pl-5">
                                        {overdueVaccinationsList.map((vaccine, index) => (
                                            <li key={index} className="text-red-500">
                                                {vaccine.vaccineName} - {vaccine.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {upcomingVaccinationsList.length > 0 && (
                                <div>
                                    <h3 className="text-green-500 font-semibold">Gelecek Aşılar:</h3>
                                    <ul className="list-disc pl-5">
                                        {upcomingVaccinationsList.map((vaccine, index) => (
                                            <li key={index} className="text-green-500">
                                                {vaccine.vaccineName} - {vaccine.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {(overdueVaccinationsList.length === 0 && upcomingVaccinationsList.length === 0) && (
                                <p>Aşı durumu bilgisi bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    )}

                    <CardContent className="space-y-4">
                        {vaccinationRecords
                            .filter(record => selectedBaby && record.babyId === selectedBaby.id)
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .map((record) => (
                                <div key={record.id} className="border rounded-md p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">{record.vaccineName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {format(record.date, "PPP")}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" onClick={() => handleEditClick(record)}>
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash className="h-4 w-4"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Bu işlem geri alınamaz. Bu aşılama kaydı sunucularımızdan kalıcı olarak silinecektir.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>İptal</AlertDialogCancel>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => deleteVaccinationRecord(record.id)}
                                                        >
                                                            Sil
                                                        </Button>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    <p className="text-sm mt-2">Parti: {record.batchNumber || "Yok"}</p>
                                    <p className="text-sm mt-1">Notlar: {record.notes || "Yok"}</p>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>

            {/* Right Side: Add New Vaccination Form */}
            <div className="w-full md:w-1/3 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Yeni Aşı Ekle</CardTitle>
                        <CardDescription>{selectedBaby?.name} için yeni bir aşı kaydı girin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedBaby ? (
                            <VaccinationRecordForm
                                onSubmit={(values) => addVaccinationRecord(
                                    {
                                        vaccineName: values.vaccineName,
                                        date: values.date,
                                        batchNumber: values.batchNumber,
                                        notes: values.notes,
                                    }
                                )}
                                vaccinationOptions={vaccinationSchedule}
                            />
                        ) : (
                            <p>Aşıları kaydetmek için lütfen bir bebek profili seçin veya ekleyin.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Aşı Kaydını Düzenle</DialogTitle>
                        <DialogDescription>
                            Aşı kayıtlarında değişiklik yapın. İşiniz bittiğinde kaydedin.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRecord ? (
                        <VaccinationRecordForm
                            initialValues={{
                                vaccineName: selectedRecord.vaccineName,
                                date: selectedRecord.date,
                                batchNumber: selectedRecord.batchNumber,
                                notes: selectedRecord.notes,
                            }}
                            onSubmit={(values) => editVaccinationRecord({
                                vaccineName: values.vaccineName,
                                date: values.date,
                                batchNumber: values.batchNumber,
                                notes: values.notes,
                                id: selectedRecord.id,
                                babyId: selectedRecord.babyId,
                            })}
                            vaccinationOptions={vaccinationSchedule}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
         )
    );
};

export default VaccinationTimeline;

