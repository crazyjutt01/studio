'use client';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function CrisisGuardianPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-destructive" />
            <h1 className="text-lg font-semibold md:text-2xl">Crisis Guardian</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Financial Crisis Support</CardTitle>
                <CardDescription>
                    Tools and resources to help you in times of financial hardship.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This feature is coming soon.</p>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
