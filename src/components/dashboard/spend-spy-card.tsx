'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { recordExpense, type RecordExpenseOutput } from '@/ai/flows/spend-spy-expense-recording';
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/data';

export function SpendSpyCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecordExpenseOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleFileChange = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      setPreview(dataUri);
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const output = await recordExpense({ receiptDataUri: dataUri });
        setResult(output);
        if (user && firestore) {
            const transactionData: Omit<Transaction, 'id'> = {
                date: output.expenseDetails.date,
                amount: output.expenseDetails.amount,
                description: output.expenseDetails.merchant,
                category: output.expenseDetails.category as Transaction['category'],
                userId: user.uid,
            };
            const transactionsCol = collection(firestore, `users/${user.uid}/transactions`);
            addDocumentNonBlocking(transactionsCol, transactionData);
             toast({
                title: 'Expense Recorded',
                description: `${output.expenseDetails.merchant} for $${output.expenseDetails.amount} has been added.`,
             });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Error Processing Receipt',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileChange(e.target.files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SpendSpy</CardTitle>
        <CardDescription>
          Upload a receipt to automatically record your expense.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!preview ? (
            <div
                className={cn(
                    "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                )}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={onBrowseClick}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                />
            </div>
        ) : (
            <div className="space-y-4">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image src={preview} alt="Receipt preview" fill={true} objectFit="contain" />
                </div>
                {isLoading && (
                    <div className="flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Analyzing receipt...</span>
                    </div>
                )}
                {error && (
                    <div className="flex items-start text-destructive p-3 bg-destructive/10 rounded-md">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {result && (
                <div className="p-4 bg-secondary/50 rounded-lg border text-sm space-y-2">
                     <div className="flex items-center text-green-600 font-medium">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Expense Recorded Successfully!
                     </div>
                     <ul className="pl-6 space-y-1 text-muted-foreground">
                        <li><strong>Merchant:</strong> {result.expenseDetails.merchant}</li>
                        <li><strong>Amount:</strong> ${result.expenseDetails.amount}</li>
                        <li><strong>Date:</strong> {result.expenseDetails.date}</li>
                        <li><strong>Category:</strong> {result.expenseDetails.category}</li>
                        {result.expenseDetails.description && <li><strong>Description:</strong> {result.expenseDetails.description}</li>}
                    </ul>
                </div>
                )}
            </div>
        )}
      </CardContent>
      {preview && (
        <CardFooter>
            <Button variant="outline" onClick={handleReset} className="w-full">
                Upload Another Receipt
            </Button>
      </CardFooter>
      )}
    </Card>
  );
}
