'use client';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserData } from '@/lib/data';
import { regions, currencies } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  monthlyIncome: z.coerce.number().positive('Monthly income must be a positive number'),
  assets: z.coerce.number().min(0, 'Assets cannot be negative'),
  smartReminders: z.boolean().default(false),
  dailyDigest: z.boolean().default(false),
  digestTime: z.string().optional(),
  region: z.string().optional(),
  currency: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      monthlyIncome: 0,
      assets: 0,
      smartReminders: false,
      dailyDigest: false,
      digestTime: '08:00',
      region: 'US',
      currency: 'USD',
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        firstName: userData.firstName,
        lastName: userData.lastName,
        monthlyIncome: userData.monthlyIncome,
        assets: userData.assets || 0,
        smartReminders: userData.smartReminders || false,
        dailyDigest: userData.dailyDigest || false,
        digestTime: userData.digestTime || '08:00',
        region: userData.region || 'US',
        currency: userData.currency || 'USD',
      });
    }
  }, [userData, form]);
  
  const watchedRegion = form.watch('region');

  useEffect(() => {
    if(watchedRegion) {
        const regionData = regions.find(r => r.value === watchedRegion);
        if(regionData) {
            form.setValue('currency', regionData.currency);
        }
    }
  }, [watchedRegion, form]);

  const { isSubmitting, isDirty } = form.formState;

  async function onSubmit(values: ProfileFormValues) {
    if (!userDocRef) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Not logged in or user profile does not exist.',
        });
        return;
    }
    try {
      updateDocumentNonBlocking(userDocRef, values);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
      form.reset(values); // This will reset the form's dirty state
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile. Please try again.',
      });
    }
  }
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-2">
            <UserIcon className="w-8 h-8 text-primary" />
            <h1 className="text-lg font-semibold md:text-2xl">Profile & Settings</h1>
        </div>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>Manage your personal information and financial settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isUserDataLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="monthlyIncome"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly Income</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="assets"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Assets</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Value of investments, property, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </CardContent>
                        
                        <Separator className="my-6" />

                        <CardHeader className="-mt-6">
                            <CardTitle>Localization</CardTitle>
                            <CardDescription>Set your region and currency.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Region</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a region" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {regions.map(region => (
                                                <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select a currency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(currencies).map(([code, {name}]) => (
                                                <SelectItem key={code} value={code}>{name} ({code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        
                        <Separator className="my-6" />

                        <CardHeader className="-mt-6">
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage how you receive alerts from FinSafe.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                                control={form.control}
                                name="smartReminders"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Smart Reminders
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Receive AI-powered notifications based on your spending activity.
                                        </p>
                                    </div>
                                    <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="dailyDigest"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Daily Digest
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Get a summary of your financial activity every day.
                                        </p>
                                    </div>
                                    <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="digestTime"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Daily Digest Time</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value}
                                        disabled={!form.watch('dailyDigest')}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a time" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {timeOptions.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>

                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting || !isDirty}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
      </main>
    </>
  );
}

    