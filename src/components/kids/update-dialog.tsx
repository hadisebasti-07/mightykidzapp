'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { massUpdateKids } from '@/lib/data';
import { Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function UpdateKidsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateErrors, setUpdateErrors] = useState<{ line: number; error: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setCsvData('');
      setUpdateErrors([]);
      setIsUpdating(false);
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!csvData.trim()) {
      toast({ variant: 'destructive', title: 'No data provided', description: 'Please paste CSV data into the text area.' });
      return;
    }

    setUpdateErrors([]);
    setIsUpdating(true);

    try {
      const { successCount, errorCount, errors } = await massUpdateKids(csvData);

      if (errorCount > 0) {
        setUpdateErrors(errors);
        if (successCount > 0) {
          toast({ title: 'Partial Update', description: `${successCount} updated, ${errorCount} rows had errors.` });
        } else {
          toast({ variant: 'destructive', title: 'Update Failed', description: `${errorCount} errors. See details below.` });
        }
      } else if (successCount > 0) {
        toast({ title: 'Update Successful', description: `${successCount} kid(s) updated. The page will now refresh.` });
        setTimeout(() => window.location.reload(), 2000);
        setIsOpen(false);
      } else {
        toast({ title: 'Nothing Updated', description: 'No matching kids found. Check your id or barcode column.' });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: e.message || 'An unexpected error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const csvHeaders = `id,barcode,firstName,lastName,nickname,dateOfBirth,gender,email,parentName,parentPhone,parent2Name,parent2Phone,className,houseColor,status,allergies,medicalNotes`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCw />
          Update Kids
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mass Update Kids</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p>
                Match kids by <strong>id</strong> or <strong>barcode</strong>. Only non-empty columns are updated — blank cells are left unchanged.
                If no match is found, the row is <strong>created</strong> as a new kid with whatever fields are provided.
              </p>
              <p>Header row is optional — it will be skipped automatically.</p>
              <code className="block rounded bg-muted p-2 text-xs text-foreground break-all whitespace-pre-wrap">
                {csvHeaders}
              </code>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder={csvHeaders}
            className="min-h-[150px] font-mono text-xs"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
        </div>

        {updateErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Errors</AlertTitle>
            <AlertDescription>
              <ScrollArea className="h-32 mt-2">
                <ul className="space-y-1 text-xs">
                  {updateErrors.map((err, i) => (
                    <li key={i}><strong>Line {err.line}:</strong> {err.error}</li>
                  ))}
                </ul>
              </ScrollArea>
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Kids
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
