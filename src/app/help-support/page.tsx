'use client';
import { Header } from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LifeBuoy, Mail, Users, Code, FileText, Presentation, Award, Quote, Map, BookOpen } from 'lucide-react';

const faqs = [
    {
      question: 'How do I add a transaction?',
      answer: 'You can add a transaction in two ways: either manually by clicking the "Add Transaction" button on the Dashboard or SpendSpy page, or automatically by uploading a receipt image on the SpendSpy page.',
    },
    {
      question: 'How does SpendSpy work?',
      answer: 'SpendSpy uses AI to read the details from a receipt you upload. It extracts the merchant name, date, total amount, and category, then automatically creates a transaction for you.',
    },
    {
      question: 'What is BudgetBot?',
      answer: 'BudgetBot is your AI budgeting assistant. You can create manual budgets for different categories. You can also ask the AI to generate a personalized monthly budget for you based on your income, goals, and spending habits.',
    },
    {
      question: 'How do I set a savings goal?',
      answer: 'Go to the GoalGuru page and click "Add Goal". You can specify a name for your goal (like "Vacation Fund"), a target amount, and an optional deadline. GoalGuru AI can also provide tips to help you reach your goals faster.',
    },
    {
      question: 'What is AdvisorAI?',
      answer: 'AdvisorAI is your on-demand financial chatbot. You can ask it questions in plain English about your finances, like "How much did I spend on food this month?" or "Am I on track to meet my savings goal?". It uses your live data to give you instant answers.',
    },
    {
      question: 'How does Gamification work?',
      answer: "You earn rewards for being financially active! Completing daily, weekly, and monthly challenges earns you XP and Coins. Specific actions also grant rewards: adding a transaction manually earns you 10 XP and 10 Coins, creating a budget gets you 25 XP and 25 Coins, and setting a savings goal awards 50 XP and 50 Coins. XP (Experience Points) help you level up, unlocking new features and higher-tier challenges. Coins will be used to buy in-app rewards in a future update—stay tuned!",
    },
    {
      question: 'How do I update my income or assets?',
      answer: 'Navigate to the Settings page from the user menu in the header. There you can update your first name, last name, monthly income, and total current assets. This information helps the AI give you more accurate advice.',
    },
  ];

const developers = [
    { name: 'Mahyudeen Shahid', role: 'Developer & Team Lead', icon: Code },
    { name: 'Shahzaib Javeed', role: 'Documentation', icon: FileText },
    { name: 'Syeda Hania Zahra', role: 'Presentation & Documentation', icon: Presentation },
];

const guideSteps = [
    {
        title: "Step 1: Sign Up & Personalize Your Profile",
        content: "First, create your account using either email and password or Google Sign-In. Upon your first login, head to the Settings page. This is a crucial step! Update your Monthly Income, Assets, Region, and Currency. This information powers all the AI features and ensures the advice you get is perfectly tailored to you."
    },
    {
        title: "Step 2: Get to Know Your Dashboard",
        content: "The Dashboard is your financial command center. The 'Monthly Overview' card gives you a snapshot of your income, spending, and savings rate. 'Net Worth' shows your overall financial health by combining your assets and savings. 'Recent Transactions' gives you a quick look at where your money is going."
    },
    {
        title: "Step 3: Automate Expenses with SpendSpy",
        content: "Tired of manual data entry? Go to the SpendSpy page and simply drag and drop a receipt image. Our AI will automatically read the receipt, extract all the important details (merchant, date, amount, category), and record the transaction for you instantly. It's a huge time-saver!"
    },
    {
        title: "Step 4: Take Control with BudgetBot",
        content: "On the BudgetBot page, you can manually create budgets for different spending categories (like Food or Shopping). For a smarter approach, click 'Generate My Budget'. The AI will analyze your income and spending to create a realistic, personalized budget plan to help you stay on track."
    },
    {
        title: "Step 5: Crush Your Goals with GoalGuru",
        content: "The GoalGuru page is where you can set and track your savings goals. Add a goal, like a 'New Car' fund, and watch your progress. Feeling stuck? Click 'Get Goal-Hacking Tips' and the GoalGuru AI will give you personalized, actionable advice on how to cut costs and save more effectively."
    },
    {
        title: "Step 6: Get Instant Answers with AdvisorAI",
        content: "Have a quick financial question? Click the floating chat button in the corner to talk to AdvisorAI. You can ask anything, like 'How much did I spend on travel last month?' or 'Am I on track to meet my savings goal?'. The AI uses your live data to provide instant, accurate answers."
    },
    {
        title: "Step 7: Stay Protected with Crisis Guardian",
        content: "Financial emergencies can be stressful. On the Crisis Guardian page, you can analyze your finances for signs of distress. If the AI detects a potential issue, like a sudden large expense, it will provide an empathetic message and a step-by-step recovery plan. You can also add emergency contacts here for peace of mind."
    }
];


export default function HelpSupportPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-8 h-8 text-primary" />
          <h1 className="text-lg font-semibold md:text-2xl">
            Help & Support
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            <Card className="xl:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Map className="h-5 w-5" />
                        Step-by-Step Guide
                    </CardTitle>
                    <CardDescription>Follow these steps to get the most out of FinSafe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                    {guideSteps.map((step, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-base font-semibold">{step.title}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {step.content}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
            </Card>
            <Card className="xl:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Us
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Have questions, feedback, or need support? We'd love to hear from you. Reach out to our team lead directly.</p>
                        <Button asChild>
                            <a href="mailto:mahyudeenjutt@gmail.com">Email Support</a>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Meet the Team
                        </CardTitle>
                        <CardDescription>The talented developers behind FinSafe.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {developers.map(dev => {
                                const Icon = dev.icon;
                                return (
                                <div key={dev.name} className="flex items-center gap-4">
                                    <div className="p-3 bg-muted rounded-full">
                                        <Icon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{dev.name}</p>
                                            {dev.role.includes('Team Lead') && <Award className="h-5 w-5 text-yellow-500" />}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{dev.role}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <blockquote className="flex items-start gap-3">
                                <Quote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                                <p className="text-sm italic text-muted-foreground">"Teamwork is the ability to work together toward a common vision. The ability to direct individual accomplishments toward organizational objectives. It is the fuel that allows common people to attain uncommon results."</p>
                            </blockquote>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </>
  );
}
