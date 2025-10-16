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
    tip: z.string().describe('A helpful tip for completing the challenge.'),
});

const CreateChallengesOutputSchema = z.object({
  daily: ChallengeSchema.optional(),
  weekly: ChallengeSchema.optional(),
  monthly: ChallengeSchema.optional(),
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

Generate challenges based on the following rules:

1.  **Daily Challenge (Required)**: Always generate one general, useful daily challenge.
2.  **Weekly & Monthly Challenges (Conditional)**:
    - If the user HAS saving goals (i.e., 'savingGoals' is not empty), generate one weekly and one monthly challenge tailored to help them achieve those goals. For example, if they are saving for a 'Vacation', a weekly challenge could be "Skip one takeout meal and put that money towards your Vacation fund."
    - If the user has NO saving goals, DO NOT generate weekly or monthly challenges.
3.  **Difficulty**: Adjust the difficulty based on the user's level. Higher level users should get slightly harder challenges.
4.  **Rewards**: Assign XP and Coin rewards. Daily challenges should have the lowest rewards, weekly medium, and monthly the highest. (e.g., Daily: 25-50 XP, Weekly: 100-150 XP, Monthly: 250-500 XP. Coins can be ~1.5x the XP).
5.  **Tips**: For EACH challenge generated, provide a short, actionable 'tip' to help the user complete it.
6.  **Style**: Make the titles catchy and the descriptions clear. Use emojis to make it fun!

**Example Output (with goals):**
{
  "daily": { "title": "☕ No-Spend Coffee", "description": "Make your own coffee at home today instead of buying.", "xp": 25, "coins": 40, "tip": "Pre-grind your coffee beans the night before to make your morning routine faster." },
  "weekly": { "title": "🛒 One Grocery Trip", "description": "Plan your meals and stick to a single grocery shopping trip for the whole week.", "xp": 100, "coins": 150, "tip": "Use a shopping list app and don't shop when you're hungry to avoid impulse buys." },
  "monthly": { "title": "📊 Budget Review Pro", "description": "Review all your spending from this month and adjust one budget category for next month.", "xp": 300, "coins": 450, "tip": "Focus on the 'wants' category first. Can you reduce it by 5%?" }
}

**Example Output (no goals):**
{
  "daily": { "title": "📱 Digital Detox", "description": "Unsubscribe from 3 marketing emails to reduce temptation.", "xp": 30, "coins": 45, "tip": "Search your inbox for the word 'unsubscribe' to quickly find marketing lists." }
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
