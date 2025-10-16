'use server';

/**
 * @fileOverview Generates personalized financial challenges for the user.
 *
 * - createChallenges - A function that generates daily, weekly, and monthly challenges.
 * - CreateChallengesInput - The input type for the createChallenges function.
 * - CreateChallengesOutput - The return type for the createChallenges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateChallengesInputSchema = z.object({
  userId: z.string().describe('The user ID.'),
  savingGoals: z
    .string()
    .optional()
    .describe("A JSON string of the user's saving goals."),
  level: z.number().describe('The user\'s current level.'),
  region: z.string().optional().describe('The user\'s region (e.g., US, GB).'),
  currency: z.string().optional().describe('The user\'s currency (e.g., USD, GBP).'),
});
export type CreateChallengesInput = z.infer<typeof CreateChallengesInputSchema>;

const ChallengeSchema = z.object({
    title: z.string().describe('The title of the challenge.'),
    description: z.string().describe('A short description of what the user needs to do.'),
    xp: z.number().describe('The XP reward for completing the challenge.'),
    coins: z.number().describe('The coin reward for completing the challenge.'),
});

const CreateChallengesOutputSchema = z.object({
  daily: ChallengeSchema,
  weekly: ChallengeSchema,
  monthly: ChallengeSchema,
});
export type CreateChallengesOutput = z.infer<
  typeof CreateChallengesOutputSchema
>;

export async function createChallenges(
  input: CreateChallengesInput
): Promise<CreateChallengesOutput> {
  return createChallengesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createChallengesPrompt',
  input: {schema: CreateChallengesInputSchema},
  output: {schema: CreateChallengesOutputSchema},
  prompt: `You are a motivating and creative AI game master for a finance app called FinSafe. Your job is to create engaging daily, weekly, and monthly challenges for a user to help them improve their financial habits. The user is from the '{{{region}}}' region, uses '{{{currency}}}' currency, and is at level {{{level}}}.

User's Saving Goals: {{{savingGoals}}}

Generate one challenge for each period (daily, weekly, monthly).

- **Personalization**: If the user has saving goals, tailor the challenges to help them achieve those goals. For example, if they are saving for a 'Vacation', a weekly challenge could be "Skip one takeout meal and put that money towards your Vacation fund."
- **General Challenges**: If there are no saving goals, create general but useful challenges like "Review your subscriptions for any you can cancel" or "No impulse buys for 24 hours."
- **Difficulty**: Adjust the difficulty based on the user's level. Higher level users should get slightly harder challenges.
- **Rewards**: Assign XP and Coin rewards to each challenge. Daily challenges should have the lowest rewards, and monthly the highest. A good range is 25-50 XP for daily, 100-150 XP for weekly, and 250-500 XP for monthly. Coins can be 1.5x the XP.

Make the titles catchy and the descriptions clear and concise. Use emojis to make it fun!

**Example Output Structure:**
{
  "daily": { "title": "☕ No-Spend Coffee", "description": "Make your own coffee at home today instead of buying.", "xp": 25, "coins": 40 },
  "weekly": { "title": "🛒 One Grocery Trip", "description": "Plan your meals and stick to a single grocery shopping trip for the whole week.", "xp": 100, "coins": 150 },
  "monthly": { "title": "📊 Budget Review Pro", "description": "Review all your spending from this month and adjust one budget category for next month.", "xp": 300, "coins": 450 }
}
`,
});

const createChallengesFlow = ai.defineFlow(
  {
    name: 'createChallengesFlow',
    inputSchema: CreateChallengesInputSchema,
    outputSchema: CreateChallengesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
