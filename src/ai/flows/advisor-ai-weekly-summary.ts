'use server';

/**
 * @fileOverview Generates a simple summary of the user's weekly spending.
 *
 * - advisorAIWeeklySummary - A function that generates the weekly spending summary.
 * - AdvisorAIWeeklySummaryInput - The input type for the advisorAIWeeklySummary function.
 * - AdvisorAIWeeklySummaryOutput - The return type for the advisorAIWeeklySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvisorAIWeeklySummaryInputSchema = z.object({
  weeklySpendingData: z
    .string()
    .describe(
      'A JSON string containing the user weekly spending data, with spending categories and amounts.'
    ),
    question: z.string().optional().describe('A specific question from the user about their finances.'),
});
export type AdvisorAIWeeklySummaryInput = z.infer<
  typeof AdvisorAIWeeklySummaryInputSchema
>;

const AdvisorAIWeeklySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the user weekly spending or an answer to their question.'),
});
export type AdvisorAIWeeklySummaryOutput = z.infer<
  typeof AdvisorAIWeeklySummaryOutputSchema
>;

export async function advisorAIWeeklySummary(
  input: AdvisorAIWeeklySummaryInput
): Promise<AdvisorAIWeeklySummaryOutput> {
  return advisorAIWeeklySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advisorAIWeeklySummaryPrompt',
  input: {schema: AdvisorAIWeeklySummaryInputSchema},
  output: {schema: AdvisorAIWeeklySummaryOutputSchema},
  prompt: `You are a personal finance advisor. Your name is AdvisorAI.
  
  You have access to the user's weekly spending data.
  
  If the user asks a specific question, answer it based on the data provided.
  If the user does not ask a question, generate a concise summary of their weekly spending. Focus on key spending areas and any notable trends. Be friendly and encouraging.

  Weekly Spending Data: {{{weeklySpendingData}}}
  User Question: {{{question}}}

  Response:
`,
});

const advisorAIWeeklySummaryFlow = ai.defineFlow(
  {
    name: 'advisorAIWeeklySummaryFlow',
    inputSchema: AdvisorAIWeeklySummaryInputSchema,
    outputSchema: AdvisorAIWeeklySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
