'use client';

import { useState } from 'react';
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
import { importKids } from '@/lib/data';
import { Loader2, Upload } from 'lucide-react';

export function ImportKidsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        variant: 'destructive',
        title: 'No data provided',
        description: 'Please paste CSV data into the text area.',
      });
      return;
    }

    setIsImporting(true);
    try {
      const { successCount, errorCount, errors } = await importKids(csvData);
      
      if (successCount > 0 && errorCount > 0) {
        toast({
          title: 'Partial Success',
          description: `Successfully imported ${successCount} kid(s). Failed to import ${errorCount}. Check console for details. Page will refresh.`,
        });
        console.error('Import errors:', errors);
        setTimeout(() => window.location.reload(), 2000);
      } else if (successCount > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${successCount} kid(s). Page will now refresh.`,
        });
        setTimeout(() => window.location.reload(), 2000);
      } else if (errorCount > 0) {
        toast({
          variant: 'destructive',
          title: `${errorCount} Import Errors`,
          description: `No kids were imported. Check console for details.`,
        });
        console.error('Import errors:', errors);
      } else {
         toast({
          title: 'No Data Imported',
          description: 'The data provided was empty or did not contain valid entries.',
        });
      }

      if (errorCount === 0) {
        setIsOpen(false);
        setCsvData('');
      }

    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: e.message || 'An unexpected error occurred during the import.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const csvHeaders = `id,firstName,lastName,dateOfBirth,gender,parentName,parentPhone,className,houseColor,nickname,allergies,medicalNotes,photoUrl,coinsBalance,totalAttendance`;
  const exampleCsv = `kid001,Liam,Smith,2018-05-12,Male,Emma Smith,111-222-3333,explorer,Blue,Li,,,https://example.com/photo.jpg,100,5`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          Import Kids
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Kids Data</DialogTitle>
          <DialogDescription>
            Paste CSV data below, with each kid on a new line. The header row is not required.
            The `id` is optional and can be left blank to auto-generate.
            <br />
            <strong>Required format:</strong>
            <code className="my-2 block rounded bg-muted p-2 text-xs text-foreground overflow-x-auto">
              {csvHeaders}
            </code>
            - `dateOfBirth`: YYYY-MM-DD
            <br />
            - `gender`: 'Male' or 'Female'
            <br />
            - `className`: 'discoverer', 'explorer', 'adventurer', or 'warrior'
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder={exampleCsv}
            className="min-h-[150px] font-mono text-xs"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}