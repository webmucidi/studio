// This file is machine-generated - do not edit!
'use server';
/**
 * @fileOverview Generates smart reminders for upcoming vaccinations based on the baby's age and vaccination history.
 *
 * - generateVaccinationReminder - A function that generates a reminder notification.
 * - GenerateVaccinationReminderInput - The input type for the generateVaccinationReminder function.
 * - GenerateVaccinationReminderOutput - The return type for the generateVaccinationReminder function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateVaccinationReminderInputSchema = z.object({
  babyAgeMonths: z.number().describe('The age of the baby in months.'),
  vaccinationHistory: z.array(
    z.object({
      vaccineName: z.string().describe('The name of the vaccine.'),
      dateAdministered: z.string().describe('The date the vaccine was administered (ISO format).'),
      batchNumber: z.string().optional().describe('The batch number of the vaccine.'),
    })
  ).describe('The vaccination history of the baby.'),
  timeZone: z.string().describe('The time zone of the user (e.g., America/Los_Angeles).'),
});
export type GenerateVaccinationReminderInput = z.infer<typeof GenerateVaccinationReminderInputSchema>;

const GenerateVaccinationReminderOutputSchema = z.object({
  reminderMessage: z.string().describe('The reminder message for the upcoming vaccination.'),
  daysUntilReminder: z.number().describe('The number of days until the reminder should be sent.'),
});
export type GenerateVaccinationReminderOutput = z.infer<typeof GenerateVaccinationReminderOutputSchema>;

export async function generateVaccinationReminder(input: GenerateVaccinationReminderInput): Promise<GenerateVaccinationReminderOutput> {
  return generateVaccinationReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVaccinationReminderPrompt',
  input: {
    schema: z.object({
      babyAgeMonths: z.number().describe('The age of the baby in months.'),
      vaccinationHistory: z.array(
        z.object({
          vaccineName: z.string().describe('The name of the vaccine.'),
          dateAdministered: z.string().describe('The date the vaccine was administered (ISO format).'),
          batchNumber: z.string().optional().describe('The batch number of the vaccine.'),
        })
      ).describe('The vaccination history of the baby.'),
      timeZone: z.string().describe('The time zone of the user (e.g., America/Los_Angeles).'),
    }),
  },
  output: {
    schema: z.object({
      reminderMessage: z.string().describe('The reminder message for the upcoming vaccination.'),
      daysUntilReminder: z.number().describe('The number of days until the reminder should be sent.'),
    }),
  },
  prompt: `You are a helpful AI assistant that generates smart reminders for parents regarding their baby's upcoming vaccinations.

  Given the baby's age and vaccination history, determine the next recommended vaccination and generate a reminder message.
  Also, determine the optimal number of days before the vaccination to send the reminder, taking into account the user's time zone.

  Baby's Age: {{{babyAgeMonths}}} months
  Vaccination History:
  {{#each vaccinationHistory}}
  - Vaccine: {{{vaccineName}}}, Date Administered: {{{dateAdministered}}}, Batch Number: {{{batchNumber}}}
  {{/each}}
  Time Zone: {{{timeZone}}}

  Reminder Message Format:
  "Reminder: Your baby is due for the [Vaccine Name] vaccination in [Days] days."
`,
});

const generateVaccinationReminderFlow = ai.defineFlow<
  typeof GenerateVaccinationReminderInputSchema,
  typeof GenerateVaccinationReminderOutputSchema
>(
  {
    name: 'generateVaccinationReminderFlow',
    inputSchema: GenerateVaccinationReminderInputSchema,
    outputSchema: GenerateVaccinationReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
