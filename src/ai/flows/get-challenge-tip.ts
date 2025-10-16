'use server';
/**
 * @fileOverview Provides a helpful tip for a given financial challenge.
 *
 * - getChallengeTip - A function that takes a challenge title and description and returns a tip.
 * - GetChallengeTipInput - The input type for the getChallengeTip function.
 * - GetChallengeTipOutput - The return type for the getChallengeTip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetChallengeTipInputSchema = z.object({
  title: z.string().describe('The title of the financial challenge.'),
  description: z.string().describe('The description of the financial challenge.'),
});
export type GetChallengeTipInput = z.infer<typeof GetChallengeTipInputSchema>;


const GetChallengeTipOutputSchema = z.object({
    tip: z.string().describe('An actionable tip to help the user complete the challenge.'),
});
export type GetChallengeTipOutput = z.infer<typeof GetChallengeTipOutputSchema>;


export async function getChallengeTip(
  input: GetChallengeTipInput
): Promise<GetChallengeTipOutput> {
  return getChallengeTipFlow(input);
}


const prompt = ai.definePrompt({
  name: 'getChallengeTipPrompt',
  input: { schema: GetChallengeTipInputSchema },
  output: { schema: GetChallengeTipOutputSchema },
  prompt: `You are a helpful and motivating AI assistant for the FinSafe app. A user is asking for help with a financial challenge.

Challenge Title: {{{title}}}
Challenge Description: {{{description}}}

Provide a single, concise, and actionable tip to help the user successfully complete this challenge. The tip should be encouraging and easy to understand.
`,
});

const getChallengeTipFlow = ai.defineFlow(
  {
    name: 'getChallengeTipFlow',
    inputSchema: GetChallengeTipInputSchema,
    outputSchema: GetChallengeTipOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
