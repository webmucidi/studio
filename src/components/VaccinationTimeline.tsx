"use client";

import {useState} from "react";
import {VaccinationRecordForm} from "@/components/VaccinationRecordForm";
import {VaccinationScheduleEntry} from "@/services/vaccination-schedule";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {format} from "date-fns";
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Edit, Plus, Trash, UserPlus} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {z} from "zod";
import {toast} from "@/hooks/use-toast";
import {Input} from "@/components/ui/input";

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
}

const initialVaccinationSchedule: VaccinationScheduleEntry[] = [
    {
        vaccineName: "BCG",
        recommendedAgeMonths: 0,
        description: "Protects against tuberculosis",
    },
    {
        vaccineName: "Hepatitis B",
        recommendedAgeMonths: 0,
        description: "Protects against Hepatitis B virus",
    },
    {
        vaccineName: "Polio",
        recommendedAgeMonths: 2,
        description: "Protects against poliomyelitis",
    },
    {
        vaccineName: "DTaP",
        recommendedAgeMonths: 2,
        description: "Protects against Diphtheria, Tetanus, Pertussis",
    },
    {
        vaccineName: "Hib",
        recommendedAgeMonths: 2,
        description: "Protects against Haemophilus influenzae type b",
    },
    {
        vaccineName: "Pneumococcal",
        recommendedAgeMonths: 2,
        description: "Protects against pneumococcal diseases",
    },
];

const initialVaccinationRecords: VaccinationRecord[] = [
    {
        vaccineName: "BCG",
        date: new Date("2024-01-15"),
        batchNumber: "AX123",
        notes: "No side effects observed",
        id: "1",
    },
    {
        vaccineName: "Hepatitis B",
        date: new Date("2024-01-15"),
        batchNumber: "BX456",
        notes: "Slight fever",
        id: "2",
    },
    {
        vaccineName: "Polio",
        date: new Date("2024-03-15"),
        batchNumber: "CX789",
        notes: "Given orally",
        id: "3",
    },
];

const initialBabyProfiles: BabyProfile[] = [
    {
        id: "1",
        name: "Baby A",
    },
];

const VaccinationTimeline = () => {
    const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>(initialVaccinationRecords);
    const [babyProfiles, setBabyProfiles] = useState<BabyProfile[]>(initialBabyProfiles);
    const [selectedBaby, setSelectedBaby] = useState<BabyProfile>(initialBabyProfiles[0]);
    const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddBabyDialogOpen, setIsAddBabyDialogOpen] = useState(false);
    const [newBabyName, setNewBabyName] = useState("");

    const addVaccinationRecord = (record: Omit<VaccinationRecord, "id">) => {
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

    const handleAddBaby = () => {
        if (newBabyName.trim() !== "") {
            const newBaby: BabyProfile = {
                id: Date.now().toString(),
                name: newBabyName,
            };
            setBabyProfiles([...babyProfiles, newBaby]);
            setSelectedBaby(newBaby);
            setNewBabyName("");
            setIsAddBabyDialogOpen(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background">
            {/* Left Side: Vaccination Records Timeline */}
            <div className="w-full md:w-2/3 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Vaccination Timeline</CardTitle>
                            <CardDescription>List of recorded vaccinations for {selectedBaby.name}</CardDescription>
                        </div>
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
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label
                                            htmlFor="name"
                                            className="text-right text-sm font-medium leading-none text-foreground"
                                        >
                                            Name
                                        </label>
                                        <div className="col-span-3">
                                            <Input
                                                id="name"
                                                value={newBabyName}
                                                onChange={(e) => setNewBabyName(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" onClick={handleAddBaby}>
                                    Create Baby Profile
                                </Button>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {vaccinationRecords.sort((a, b) => a.date.getTime() - b.date.getTime()).map((record) => (
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
                        <CardDescription>Record a new vaccination for {selectedBaby.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VaccinationRecordForm
                            onSubmit={(values) => addVaccinationRecord(
                                {
                                    vaccineName: values.vaccineName,
                                    date: values.date,
                                    batchNumber: values.batchNumber,
                                    notes: values.notes,
                                }
                            )}
                            vaccinationOptions={initialVaccinationSchedule}
                        />
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
                            vaccinationOptions={initialVaccinationSchedule}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VaccinationTimeline;
