'use server';
/**
 * @fileOverview This file defines a Genkit flow for automatically recording expenses from uploaded receipts using SpendSpy.
 *
 * - recordExpense - A function that handles the expense recording process from receipt data.
 * - RecordExpenseInput - The input type for the recordExpense function, including the receipt image data URI.
 * - RecordExpenseOutput - The return type for the recordExpense function, providing a structured expense record.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecordExpenseInputSchema = z.object({
  userId: z.string().describe('The user ID.'),
  receiptDataUri: z
    .string()
    .describe(
      'A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* html-escape:quotes=true */
    ),
  description: z.string().optional().describe('Optional description of the expense.'),
  region: z.string().optional().describe('The user\'s region (e.g., US, GB).'),
  currency: z.string().optional().describe('The user\'s currency (e.g., USD, GBP).'),
});
export type RecordExpenseInput = z.infer<typeof RecordExpenseInputSchema>;

const RecordExpenseOutputSchema = z.object({
  expenseDetails: z.object({
    date: z.string().describe('The date of the expense (YYYY-MM-DD).'),
    merchant: z.string().describe('The name of the merchant.'),
    amount: z.number().describe('The amount of the expense.'),
    category: z.string().describe('The category of the expense (e.g., food, travel, shopping).'),
    description: z.string().optional().describe('A description of the expense.'),
  }),
});
export type RecordExpenseOutput = z.infer<typeof RecordExpenseOutputSchema>;

export async function recordExpense(input: RecordExpenseInput): Promise<RecordExpenseOutput> {
  return recordExpenseFlow(input);
}

const recordExpensePrompt = ai.definePrompt({
  name: 'recordExpensePrompt',
  input: {schema: RecordExpenseInputSchema},
  output: {schema: RecordExpenseOutputSchema},
  prompt: `You are an AI assistant specialized in extracting expense details from receipt images. You are operating for a user in the '{{{region}}}' region and their currency is '{{{currency}}}'.

  Analyze the provided receipt image and extract the following information:
  - Date: The date of the expense (YYYY-MM-DD).
  - Merchant: The name of the merchant.
  - Amount: The total amount of the expense.
  - Category: The category of the expense. You MUST choose one of the following categories: Food, Travel, Shopping, Bills, Others.
  - Description: Concisely describe the expense, incorporating any provided description.

  Return the extracted information in JSON format, matching the schema.

  Receipt Image: {{media url=receiptDataUri}}
  Description: {{{description}}}

  Make sure the "amount" field is a number and not a string.
`,
});

const recordExpenseFlow = ai.defineFlow(
  {
    name: 'recordExpenseFlow',
    inputSchema: RecordExpenseInputSchema,
    outputSchema: RecordExpenseOutputSchema,
  },
  async input => {
    const {output} = await recordExpensePrompt(input);
    return output!;
  }
);
