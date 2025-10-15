# FinSafe: Your Personal AI-Powered Finance Assistant

FinSafe is a modern, responsive web application built with Next.js that leverages the power of Generative AI to provide users with intelligent financial insights, automated expense tracking, and personalized advice to help them achieve their financial goals.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore & Authentication)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (Powered by Google's Gemini models)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## Deployment Guide

To deploy your FinSafe application to Firebase App Hosting and ensure all AI features function correctly, you need to securely provide your Gemini API Key to the production environment.

Follow these steps:

### Step 1: Get a Gemini API Key

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** and then **"Create API key in new project"**.
3.  Copy the generated API key. You will need it in the next step.

### Step 2: Store the API Key in Google Cloud Secret Manager

1.  Go to the [Google Cloud Secret Manager page](https://console.cloud.google.com/security/secret-manager) for your Firebase project.
2.  Click **"Create secret"**.
3.  For the **Name**, enter `GEMINI_API_KEY`.
4.  In the **Secret value** field, paste the Gemini API key you copied from AI Studio.
5.  Click **"Create secret"**.

### Step 3: Grant App Hosting Access to the Secret

You need to tell Firebase App Hosting that your application requires access to the secret you just created.

1.  Open the `apphosting.yaml` file in your project.
2.  Add the `env` section to expose the `GEMINI_API_KEY` secret to your application at runtime. The file should look like this:

    ```yaml
    runConfig:
      minInstances: 0
    env:
      - variable: GEMINI_API_KEY
        secret: GEMINI_API_KEY
    ```

3.  Finally, you need to give the App Hosting service account permission to access the secret.
    *   Find your service account email in the App Hosting dashboard in Firebase. It will look something like `app-hosting-backend-id@project-id.iam.gserviceaccount.com`.
    *   Go back to the [Secret Manager page](https://console.cloud.google.com/security/secret-manager), select your `GEMINI_API_KEY` secret.
    *   In the permissions panel on the right, click **"Add principal"**.
    *   Paste your service account email into the **"New principals"** field.
    *   For the role, select **"Secret Manager Secret Accessor"**.
    *   Click **"Save"**.

After completing these steps, you can deploy your application from Firebase Studio, and the AI agents will be fully functional.

---

## Core Features

### 1. Secure Authentication (Login & Sign-Up)

-   **Why it's important**: Secure authentication is the foundation of a personalized financial app. It ensures that each user's sensitive financial data is kept private and accessible only to them. FinSafe offers both traditional email/password and convenient Google Sign-In options.
-   **How to use it**:
    -   **Sign-Up**: New users can visit the "Sign Up" page to create an account using their email and a password or by simply clicking the "Sign up with Google" button. This creates their secure user profile in the backend.
    -   **Login**: Existing users can log in through the "Login" page using their credentials or Google account.
-   **Onboarding**: Upon first sign-in, FinSafe creates a personal and secure space for the user in the database, ensuring all their future financial data is stored privately.

### 2. The Dashboard (`/dashboard`)

-   **Why it's important**: The dashboard provides a "financial command center" where users can get a high-level overview of their financial health at a glance. It consolidates the most critical information into one place, making it easy to spot trends and stay informed.
-   **How it works**:
    -   **Monthly Overview Card**: This card gives a snapshot of the current month's finances, including:
        -   **Total Income**: Pulled from the user's profile settings.
        -   **Total Spending**: A real-time sum of all transactions for the month.
        -   **Savings Rate**: The percentage of income saved, a key indicator of financial health.
        -   **Net Flow**: The difference between income and spending, showing if the user is saving or overspending.
        -   **Spending Chart**: A clear bar chart that visualizes spending across different categories (Food, Travel, etc.).
    -   **Net Worth Card**: This card tracks the user's overall financial position. It calculates net worth by combining the user's "Current Assets" (from their profile) with the total amount saved in their goals. An area chart shows the net worth trend over time.
    -   **Recent Transactions Card**: This card lists the most recent transactions, providing a quick way to review spending. Users can also click the "Add Transaction" button to manually log a new expense directly from the dashboard.

### 3. SpendSpy (`/spend-spy`)

-   **Why it's important**: Expense tracking is often tedious. SpendSpy automates this process using AI, making it effortless to maintain accurate financial records. By simply taking a picture of a receipt, users can ensure their spending is accurately captured.
-   **How to use it**:
    1.  Navigate to the **SpendSpy** page.
    2.  Drag and drop an image of a receipt onto the upload area, or click to browse for the file.
    3.  The `recordExpense` Genkit flow sends the image to an AI model, which extracts the merchant name, date, total amount, and category.
    4.  The extracted details are used to automatically create a new transaction record, which is saved to Firestore and immediately reflected in the "Recent Transactions" list.

### 4. BudgetBot (`/budget-bot`)

-   **Why it's important**: Budgeting is key to financial control. BudgetBot goes beyond simple tracking by providing AI-driven advice. It helps users create realistic budgets that align with their income, spending habits, and long-term goals.
-   **How it works**:
    -   **Budgets Card**: Users can create and monitor their budgets. For each budget, a progress bar shows how much has been spent against the limit.
    -   **BudgetBot AI**: By clicking **"Generate My Budget"**, the user triggers the `getPersonalizedBudget` Genkit flow. This AI analyzes the user's income, assets, recent transactions, and savings goals to generate a recommended monthly budget broken down by category. This provides a concrete, personalized spending plan to help the user stay on track.

### 5. GoalGuru (`/goal-guru`)

-   **Why it's important**: Financial goals can feel distant and hard to reach. GoalGuru makes goals tangible by visualizing progress and providing AI-powered motivation and advice, helping users stay focused on their long-term objectives.
-   **How it works**:
    -   **Savings Goals Card**: Users can add, view, and track their savings goals (e.g., "Vacation Fund," "New Car"). Each goal displays the target amount, current amount saved, and a progress bar.
    -   **GoalGuru AI**: By clicking **"Get Goal-Hacking Tips"**, the user triggers the `getGoalAdvice` Genkit flow. The AI analyzes the user's financial data and generates a list of personalized, actionable tips designed to help them cut costs and accelerate their savings.

### 6. AdvisorAI (Floating Chat & `/advisor-ai`)

-   **Why it's important**: Financial questions can arise at any time. AdvisorAI acts as an on-demand financial expert, accessible from anywhere in the app. It provides instant, context-aware answers based on the user's live financial data.
-   **How to use it**:
    -   Click the floating chat button in the bottom-right corner of any page or navigate to the dedicated **AdvisorAI** page.
    -   Ask questions in plain English, such as "How much did I spend on food last week?" or "Am I on track to meet my savings goals?"
    -   The `advisorAIWeeklySummary` Genkit flow accesses the user's live transactions, budgets, and goals from Firestore to provide an instant, data-driven answer.

### 7. Crisis Guardian (`/crisis-guardian`)

-   **Why it's important**: Financial emergencies can be stressful. Crisis Guardian acts as an AI-powered safety net, helping users identify signs of financial distress and providing a calm, actionable plan to get back on track.
-   **How it works**:
    -   On the **Crisis Guardian** page, the user can click **"Analyze for Financial Stress"**.
    -   The `getCrisisSupport` Genkit flow analyzes recent transactions for anomalies (like a sudden large expense or consistent overspending).
    -   If a stress event is detected, the AI responds with an empathetic message and a step-by-step recovery plan, which might include suggestions like temporarily pausing a savings goal or adjusting a budget.
    -   Users can also add **Emergency Contacts** on this page for easy access in times of need.

### 8. User Profile & Settings (`/settings`)

-   **Why it's important**: Personalization is key. The settings page gives users control over the data that powers the app's insights, such as their income and assets.
-   **How to use it**:
    -   Navigate to the **Settings** page via the user menu in the header.
    -   Here, users can view and update their first name, last name, monthly income, and total assets.
    -   Changes are saved directly to their user document in Firestore, ensuring all AI-driven advice and calculations across the app are always based on the most up-to-date information.
