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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          Import Kids
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Kids Data</DialogTitle>
          <DialogDescription>
            Paste CSV data below. Each line should contain one kid's record.
            The required format is:
            <code className="my-2 block rounded bg-muted p-2 text-sm text-foreground">
              firstName,lastName,YYYY-MM-DD,gender,parentName,parentPhone,className,houseColor
            </code>
            (gender must be 'Male' or 'Female'. class must be 'discoverer', 'explorer', 'adventurer', or 'warrior'. houseColor is optional)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Liam,Smith,2018-05-12,Male,Emma Smith,111-222-3333,explorer,Blue&#10;Olivia,Jones,2019-09-20,Female,Noah Jones,444-555-6666,discoverer,Red"
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
