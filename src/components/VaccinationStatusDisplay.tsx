"use client";

import {useState, useEffect, useCallback} from "react";
import {VaccinationScheduleEntry} from "@/services/vaccination-schedule";
import {differenceInMonths, isPast, isFuture} from "date-fns";
import {VaccinationRecord} from "@/components/VaccinationTimeline";
import {CardContent} from "@/components/ui/card";
import {BabyProfile} from "@/components/VaccinationTimeline";

interface VaccinationStatusDisplayProps {
    selectedBaby: BabyProfile;
    vaccinationSchedule: VaccinationScheduleEntry[];
    vaccinationRecords: VaccinationRecord[];
}

const VaccinationStatusDisplay: React.FC<VaccinationStatusDisplayProps> = ({selectedBaby, vaccinationSchedule, vaccinationRecords}) => {
    const [overdueVaccinationsList, setOverdueVaccinationsList] = useState<VaccinationScheduleEntry[]>([]);
    const [upcomingVaccinationsList, setUpcomingVaccinationsList] = useState<VaccinationScheduleEntry[]>([]);
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

    useEffect(() => {
        if (selectedBaby) {
            setOverdueVaccinationsList(calculateOverdueVaccinations());
            setUpcomingVaccinationsList(calculateUpcomingVaccinations());
        } else {
            setOverdueVaccinationsList([]);
            setUpcomingVaccinationsList([]);
        }
    }, [vaccinationSchedule, vaccinationRecords, selectedBaby, ageInMonths, calculateOverdueVaccinations, calculateUpcomingVaccinations]);

    return (
        <>
            {selectedBaby && (
                <>
                    {overdueVaccinationsList.length > 0 && (
                        <CardContent>
                            <h3 className="text-red-500 font-semibold">Gecikmiş Aşılar:</h3>
                            <ul className="list-disc pl-5">
                                {overdueVaccinationsList.map((vaccine, index) => (
                                    <li key={index} className="text-red-500">
                                        {vaccine.vaccineName} - {vaccine.description}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    )}
                    {upcomingVaccinationsList.length > 0 && (
                        <CardContent>
                            <h3 className="text-green-500 font-semibold">Gelecek Aşılar:</h3>
                            <ul className="list-disc pl-5">
                                {upcomingVaccinationsList.map((vaccine, index) => (
                                    <li key={index} className="text-green-500">
                                        {vaccine.vaccineName} - {vaccine.description}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    )}
                </>
            )}
        </>
    );
};

export default VaccinationStatusDisplay;
