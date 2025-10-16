'use client';
import { Header } from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Mail, Users } from 'lucide-react';

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
      question: 'How do I update my income or assets?',
      answer: 'Navigate to the Settings page from the user menu in the header. There you can update your first name, last name, monthly income, and total current assets. This information helps the AI give you more accurate advice.',
    },
  ];

const developers = [
    { name: 'Alice Johnson', role: 'Lead Frontend Developer' },
    { name: 'Bob Williams', role: 'Backend & AI Specialist' },
    { name: 'Charlie Brown', role: 'UI/UX Designer' },
]

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Contact Us
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Have questions or feedback? We'd love to hear from you. Reach out to our support team.</p>
                    <Button asChild>
                        <a href="mailto:support@finsafe.app">Email Support</a>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Meet the Developers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {developers.map(dev => (
                            <li key={dev.name} className="flex flex-col">
                                <span className="font-semibold">{dev.name}</span>
                                <span className="text-sm text-muted-foreground">{dev.role}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
