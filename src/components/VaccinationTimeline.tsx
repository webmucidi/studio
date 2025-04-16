"use client";

import {useState, useEffect} from "react";
import {VaccinationRecordForm} from "@/components/VaccinationRecordForm";
import {VaccinationScheduleEntry, getVaccinationScheduleForAge} from "@/services/vaccination-schedule";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {format, differenceInMonths, isBefore} from "date-fns";
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Edit, Plus, Trash, UserPlus} from "lucide-react";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface VaccinationRecord {
    vaccineName: string;
    date: Date;
    batchNumber?: string;
    notes?: string;
    id: string;
}

interface BabyProfile {
    id: string;
    name: string;
    birthDate: Date;
}

const initialVaccinationRecords: VaccinationRecord[] = [];

const initialBabyProfiles: BabyProfile[] = [
];

const AddBabyFormSchema = z.object({
    name: z.string().min(2, {
        message: "Baby name must be at least 2 characters.",
    }),
    birthDate: z.date({
        required_error: "A date of birth is required.",
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
                            <FormLabel>Baby name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter baby name" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name of the baby.
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
                            <FormLabel>Date of birth</FormLabel>
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
                                                <span>Pick a date</span>
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
                                Enter the date of birth of the baby.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}

const VaccinationTimeline = () => {
    const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>(initialVaccinationRecords);
    const [babyProfiles, setBabyProfiles] = useState<BabyProfile[]>(initialBabyProfiles);
    const [selectedBaby, setSelectedBaby] = useState<BabyProfile | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddBabyDialogOpen, setIsAddBabyDialogOpen] = useState(false);
    const [vaccinationSchedule, setVaccinationSchedule] = useState<VaccinationScheduleEntry[]>([]);
    const [isAddBabyFormOpen, setIsAddBabyFormOpen] = useState(false);

    useEffect(() => {
        if (selectedBaby) {
            const ageInMonths = differenceInMonths(new Date(), selectedBaby.birthDate);
            getVaccinationScheduleForAge(ageInMonths)
                .then(schedule => setVaccinationSchedule(schedule))
                .catch(error => {
                    console.error("Failed to fetch vaccination schedule", error);
                    toast({
                        title: "Error",
                        description: "Failed to load vaccination schedule for the selected baby.",
                        variant: "destructive",
                    });
                });
        } else {
            setVaccinationSchedule([]);
        }
    }, [selectedBaby]);

    const addVaccinationRecord = (record: Omit<VaccinationRecord, "id">) => {
        if (!selectedBaby) {
            toast({
                title: "Error",
                description: "Please select a baby profile first.",
                variant: "destructive",
            });
            return;
        }
        const newRecord = {...record, id: Date.now().toString()};
        setVaccinationRecords([...vaccinationRecords, newRecord]);
        toast({
            title: "Success",
            description: "Added record successfully!",
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
            title: "Success",
            description: "Edited record successfully!",
        })
    };

    const deleteVaccinationRecord = (id: string) => {
        setVaccinationRecords(vaccinationRecords.filter((record) => record.id !== id));
        toast({
            title: "Success",
            description: "Deleted record successfully!",
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
        setSelectedBaby(newBaby);
        setIsAddBabyDialogOpen(false);
        setIsAddBabyFormOpen(false); // Close the form after submission
    };

    const addBaby = () => {
        setIsAddBabyFormOpen(true);
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background">
            {/* Left Side: Vaccination Records Timeline */}
            <div className="w-full md:w-2/3 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Vaccination Timeline</CardTitle>
                            <CardDescription>
                                {selectedBaby ?
                                    `List of recorded vaccinations for ${selectedBaby.name} (born on ${format(selectedBaby.birthDate, "PPP")})` :
                                    "No baby selected. Please add a baby profile."}
                            </CardDescription>
                        </div>
                        <div>
                            <Dialog open={isAddBabyDialogOpen} onOpenChange={setIsAddBabyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <UserPlus className="mr-2 h-4 w-4"/>
                                        Add Baby
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Baby Profile</DialogTitle>
                                        <DialogDescription>
                                            Create a profile for a new baby to track vaccinations.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AddBabyForm onSubmit={handleAddBaby} />
                                </DialogContent>
                            </Dialog>
                            <Select onValueChange={(value) => {
                                const baby = babyProfiles.find(profile => profile.id === value);
                                setSelectedBaby(baby || null);
                            }}
                                    defaultValue={selectedBaby?.id}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select baby"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {babyProfiles.map((baby) => (
                                        <SelectItem key={baby.id} value={baby.id}>
                                            {baby.name} (Born on {format(baby.birthDate, "PPP")})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {vaccinationRecords
                            .filter(record => selectedBaby && true)
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
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this vaccination record from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => deleteVaccinationRecord(record.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    <p className="text-sm mt-2">Batch: {record.batchNumber || "N/A"}</p>
                                    <p className="text-sm mt-1">Notes: {record.notes || "None"}</p>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>

            {/* Right Side: Add New Vaccination Form */}
            <div className="w-full md:w-1/3 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Vaccination</CardTitle>
                        <CardDescription>Record a new vaccination for {selectedBaby?.name}</CardDescription>
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
                            <p>Please select or add a baby profile to record vaccinations.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Vaccination Record</DialogTitle>
                        <DialogDescription>
                            Make changes to vaccination records here. Click save when you're done.
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
                            })}
                            vaccinationOptions={vaccinationSchedule}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VaccinationTimeline;
