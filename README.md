# FinSafe: Your Personal AI-Powered Finance Assistant

FinSafe is a modern, responsive web application built with Next.js that leverages the power of Generative AI to provide users with intelligent financial insights, automated expense tracking, and personalized advice to help them achieve their financial goals.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore & Anonymous Authentication)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (Powered by Google's Gemini models)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## Core Features

### 1. Authentication

- **Simple & Secure Sign-In**: FinSafe uses Firebase's **Anonymous Authentication** to provide a seamless onboarding experience. The first time a user visits, an anonymous account is automatically created for them.
- **Persistent Sessions**: User sessions are maintained across visits, so they can always return to their personal dashboard.
- **Automatic Data Seeding**: Upon first sign-in, the database is automatically seeded with sample data (transactions, budgets, and goals) so users can immediately explore the app's features.

### 2. Dashboard (`/dashboard`)

The central hub for your financial overview.

- **Monthly Overview Card**: Get a quick snapshot of your finances for the current month, including:
    - **Total Income**: Based on the income set in the user's profile.
    - **Total Spending**: Sum of all transactions for the month.
    - **Savings Rate**: The percentage of income saved.
    - **Net Flow**: The difference between income and spending.
    - **Spending Chart**: A bar chart visualizing spending across different categories (Food, Travel, etc.).
- **Net Worth Card**: Tracks your overall financial position with a summary and an area chart showing the trend over time.
- **Recent Transactions Card**: Displays a list of your most recent transactions. You can also quickly add a new transaction directly from this card.

### 3. SpendSpy (`/spend-spy`)

Automate expense tracking with the power of AI.

- **Receipt Upload**: Drag and drop or browse to upload an image of a receipt.
- **AI-Powered Extraction**: Uses a Genkit flow (`recordExpense`) that sends the receipt image to a Gemini model. The model analyzes the image and extracts key details:
    - Merchant Name
    - Transaction Date
    - Total Amount
    - Expense Category
- **Automatic Record Creation**: Once the details are extracted, a new transaction is automatically created and saved to your Firestore database.

### 4. BudgetBot (`/budget-bot`)

Tools and AI-driven advice for smart budgeting.

- **Budgets Card**: Create, view, and track your budgets. A progress bar for each budget shows how much you've spent against your limit.
- **BudgetBot AI Tips**: By clicking "Get My Tips", you trigger a Genkit flow (`getPersonalizedTips`). This flow analyzes your income, spending habits, and savings goals to generate a list of personalized, actionable financial tips.

### 5. GoalGuru (`/goal-guru`)

Stay on track with your long-term financial objectives.

- **Savings Goals Card**: Add and monitor your savings goals (e.g., "Vacation Fund", "New Car").
- **Progress Tracking**: For each goal, you can see:
    - The target amount.
    - The current amount saved.
    - A progress bar visualizing how close you are to achieving the goal.
    - The time remaining until your deadline.

### 6. AdvisorAI (Floating Chat & `/advisor-ai`)

Your on-demand AI financial advisor, accessible from anywhere in the app.

- **Conversational Interface**: Ask questions about your finances in plain English.
- **Context-Aware Responses**: AdvisorAI uses a Genkit flow (`advisorAIWeeklySummary`) that has access to your live financial data (transactions, budgets, savings goals) from Firestore.
- **Personalized Insights**: Ask questions like "How much did I spend on food last week?" or "Am I on track to meet my savings goals?" to get instant, data-driven answers and advice.
- **Floating Chat**: The chat interface can be opened from a floating button on any page, providing immediate access to AI assistance.

### 7. Crisis Guardian (`/crisis-guardian`)

A placeholder for future features designed to provide support during financial hardship. This feature is currently under development.
