'use server';

/**
 * Represents a vaccination schedule entry with age constraints.
 */
export interface VaccinationScheduleEntry {
  vaccineName: string;
  minAgeMonths: number;
  maxAgeMonths: number;
  description: string;
}

const vaccinationSchedule: VaccinationScheduleEntry[] = [
    {
        vaccineName: "Hepatit B - 1",
        minAgeMonths: 0,
        maxAgeMonths: 1,
        description: "Protects against Hepatitis B virus (1st dose)",
    },
    {
        vaccineName: "Hepatit B - 2",
        minAgeMonths: 1,
        maxAgeMonths: 2,
        description: "Protects against Hepatitis B virus (2nd dose)",
    },
    {
        vaccineName: "BCG (Verem)",
        minAgeMonths: 1,
        maxAgeMonths: 2,
        description: "Protects against tuberculosis",
    },
    {
        vaccineName: "DaBT-IPA-Hib - 1",
        minAgeMonths: 2,
        maxAgeMonths: 4,
        description: "Protects against Diphtheria, Tetanus, Pertussis, Polio, Haemophilus influenzae type b (1st dose)",
    },
    {
        vaccineName: "KPA - 1",
        minAgeMonths: 2,
        maxAgeMonths: 4,
        description: "Protects against pneumococcal diseases (1st dose)",
    },
    {
        vaccineName: "DaBT-IPA-Hib - 2",
        minAgeMonths: 4,
        maxAgeMonths: 6,
        description: "Protects against Diphtheria, Tetanus, Pertussis, Polio, Haemophilus influenzae type b (2nd dose)",
    },
    {
        vaccineName: "KPA - 2",
        minAgeMonths: 4,
        maxAgeMonths: 6,
        description: "Protects against pneumococcal diseases (2nd dose)",
    },
    {
        vaccineName: "DaBT-IPA-Hib - 3",
        minAgeMonths: 6,
        maxAgeMonths: 9,
        description: "Protects against Diphtheria, Tetanus, Pertussis, Polio, Haemophilus influenzae type b (3rd dose)",
    },
    {
        vaccineName: "OPA",
        minAgeMonths: 6,
        maxAgeMonths: 9,
        description: "Protects against poliomyelitis",
    },
    {
        vaccineName: "KKK - ID",
        minAgeMonths: 9,
        maxAgeMonths: 11,
        description: "Protects against Measles, Mumps, Rubella (additional dose for high-risk areas)",
    },
    {
        vaccineName: "KPA - R",
        minAgeMonths: 12,
        maxAgeMonths: 13,
        description: "Protects against pneumococcal diseases (booster dose)",
    },
    {
        vaccineName: "KKK - 1",
        minAgeMonths: 12,
        maxAgeMonths: 13,
        description: "Protects against Measles, Mumps, Rubella (1st dose)",
    },
    {
        vaccineName: "Hepatit A",
        minAgeMonths: 12,
        maxAgeMonths: 18,
        description: "Protects against Hepatitis A",
    },
    {
        vaccineName: "DaBT-IPA-Hib - R",
        minAgeMonths: 18,
        maxAgeMonths: 24,
        description: "Protects against Diphtheria, Tetanus, Pertussis, Polio, Haemophilus influenzae type b (booster dose)",
    },
    {
        vaccineName: "OPA - 2",
        minAgeMonths: 18,
        maxAgeMonths: 24,
        description: "Protects against poliomyelitis (2nd dose)",
    },
    {
        vaccineName: "Hepatit A - 2",
        minAgeMonths: 24,
        maxAgeMonths: 30,
        description: "Protects against Hepatitis A (2nd dose)",
    },
    {
        vaccineName: "KKK - 2",
        minAgeMonths: 48,
        maxAgeMonths: 50,
        description: "Protects against Measles, Mumps, Rubella (2nd dose)",
    },
    {
        vaccineName: "DaBT-IPA - R",
        minAgeMonths: 48,
        maxAgeMonths: 50,
        description: "Protects against Diphtheria, Tetanus, Pertussis, Polio (booster dose)",
    },
    {
        vaccineName: "Td",
        minAgeMonths: 156,
        maxAgeMonths: 168,
        description: "Protects against Tetanus and Diphtheria (booster dose)",
    },
];

/**
 * Retrieves the recommended vaccination schedule for a given age in months.
 * @param ageMonths The age in months for which to retrieve the schedule.
 * @returns An array of VaccinationScheduleEntry objects that are applicable for the given age.
 */
export async function getVaccinationScheduleForAge(ageMonths: number): Promise<VaccinationScheduleEntry[]> {
    return vaccinationSchedule.filter(entry => ageMonths >= entry.minAgeMonths && ageMonths <= entry.maxAgeMonths);
}
