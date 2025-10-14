'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, PlusCircle, User, Phone, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddEmergencyContactForm } from '@/components/forms/add-emergency-contact-form';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { EmergencyContact } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function CrisisGuardianPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const contactsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/emergencyContacts`));
  }, [user, firestore]);

  const { data: contacts, isLoading } = useCollection<EmergencyContact>(contactsQuery);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-destructive" />
            <h1 className="text-lg font-semibold md:text-2xl">Crisis Guardian</h1>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  Your trusted contacts for times of financial hardship.
                </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Contact</span>
                </Button>
              </DialogTrigger>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                )}
                {!isLoading && contacts && contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-secondary p-3 rounded-full">
                            <User className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Handshake className="h-4 w-4" /> {contact.relationship}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline">
                        <a href={`tel:${contact.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                        </a>
                      </Button>
                    </div>
                  ))
                ) : null}
                {!isLoading && (!contacts || contacts.length === 0) && (
                  <div className="text-center text-muted-foreground py-12">
                    <p>You haven't added any emergency contacts yet.</p>
                    <p className="text-sm">Add a contact to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
         <DialogContent>
            <DialogHeader>
            <DialogTitle>Add an Emergency Contact</DialogTitle>
            </DialogHeader>
            <AddEmergencyContactForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </>
    </Dialog>
  );
}

    