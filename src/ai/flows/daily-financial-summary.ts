'use server';

/**
 * @fileOverview A flow that generates a daily financial summary for a user.
 * 
 * - getDailyFinancialSummary - A function that provides a summary of daily and monthly spending.
 * - DailyFinancialSummaryInput - The input type for the getDailyFinancialSummary function.
 * - DailyFinancialSummaryOutput - The return type for the getDailyFinancialSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const DailyFinancialSummaryInputSchema = z.object({
  userId: z.string().describe('The user ID.'),
  transactions: z.string().describe('A JSON string of the user\'s transactions.'),
});

export type DailyFinancialSummaryInput = z.infer<typeof DailyFinancialSummaryInputSchema>;

export const DailyFinancialSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the user\'s daily and monthly spending.'),
  quote: z.string().describe('A motivational financial quote.'),
});

export type DailyFinancialSummaryOutput = z.infer<typeof DailyFinancialSummaryOutputSchema>;


export async function getDailyFinancialSummary(
  input: DailyFinancialSummaryInput
): Promise<DailyFinancialSummaryOutput> {
  return dailyFinancialSummaryFlow(input);
}


const prompt = ai.definePrompt({
    name: 'dailyFinancialSummaryPrompt',
    input: { schema: DailyFinancialSummaryInputSchema },
    output: { schema: DailyFinancialSummaryOutputSchema },
    prompt: `You are FinSafe, a personal finance assistant. Your task is to generate a daily financial digest for the user based on their transaction data.

    User's transactions: {{{transactions}}}
    
    1.  Calculate the total spending for today.
    2.  Calculate the total spending for the current month.
    3.  Generate a concise, one-sentence summary of this activity.
    4.  Find a short, inspirational quote about money or financial discipline.
    
    Return the information in the specified JSON format.`,
  });

const dailyFinancialSummaryFlow = ai.defineFlow(
  {
    name: 'dailyFinancialSummaryFlow',
    inputSchema: DailyFinancialSummaryInputSchema,
    outputSchema: DailyFinancialSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
