'use server';

/**
 * @fileOverview Provides immediate advice and resources for users in financial crisis.
 *
 * - `getCrisisSupport` - A function that takes a description of a financial crisis and returns supportive steps and resources.
 * - `CrisisSupportInput` - The input type for the `getCrisisSupport` function.
 * - `CrisisSupportOutput` - The return type for the `getCrisisSupport` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrisisSupportInputSchema = z.object({
  crisisDescription: z
    .string()
    .describe('A description of the user\'s current financial crisis.'),
});
export type CrisisSupportInput = z.infer<typeof CrisisSupportInputSchema>;

const CrisisSupportOutputSchema = z.object({
  supportSteps: z
    .array(
      z.object({
        title: z.string().describe('The title of the suggested step or resource.'),
        details: z.string().describe('A detailed explanation of the step or resource.'),
      })
    )
    .describe('An array of actionable steps and resources to help the user.'),
});
export type CrisisSupportOutput = z.infer<typeof CrisisSupportOutputSchema>;

export async function getCrisisSupport(
  input: CrisisSupportInput
): Promise<CrisisSupportOutput> {
  return crisisSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crisisSupportPrompt',
  input: {schema: CrisisSupportInputSchema},
  output: {schema: CrisisSupportOutputSchema},
  prompt: `You are a compassionate and helpful financial crisis assistant. Your role is to provide immediate, actionable steps and identify resources for a user in financial distress. Do not give financial advice. Focus on practical steps and pointing to credible resources.

The user is facing the following situation:
"{{{crisisDescription}}}"

Based on this situation, provide a list of supportive steps and resources. For each step, provide a clear title and detailed information. Examples include immediate steps to take, types of organizations to contact (like credit counselors or legal aid), and government programs that might be available.

Structure your response as an array of objects, where each object has a "title" and "details".
`,
});

const crisisSupportFlow = ai.defineFlow(
  {
    name: 'crisisSupportFlow',
    inputSchema: CrisisSupportInputSchema,
    outputSchema: CrisisSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
