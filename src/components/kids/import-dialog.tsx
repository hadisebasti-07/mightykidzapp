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
import { importKids } from '@/lib/data';
import { Loader2, Upload } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function ImportKidsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<{ line: number; error: string }[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Reset state when dialog is closed
    if (!isOpen) {
      setCsvData('');
      setImportErrors([]);
      setIsImporting(false);
    }
  }, [isOpen]);

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        variant: 'destructive',
        title: 'No data provided',
        description: 'Please paste CSV data into the text area.',
      });
      return;
    }
    
    setImportErrors([]);
    setIsImporting(true);

    try {
      const { successCount, errorCount, errors } = await importKids(csvData);
      
      if (errorCount > 0) {
        setImportErrors(errors.map(e => ({ line: e.line, error: e.error })));
        
        if (successCount > 0) {
          toast({
            title: 'Partial Import Success',
            description: `Successfully imported ${successCount} kid(s). ${errorCount} rows had errors. See details below.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: `Found ${errorCount} errors. Please review the details below and try again.`,
          });
        }
      } else if (successCount > 0) {
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${successCount} kid(s). The page will now refresh.`,
        });
        setTimeout(() => window.location.reload(), 3000);
        setIsOpen(false);
      } else {
         toast({
          title: 'No Data Imported',
          description: 'The CSV data was empty or did not contain any valid rows.',
        });
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

  const csvHeaders = `id,firstName,lastName,dateOfBirth,gender,email,parentName,parentPhone,parent2Name,parent2Phone,className,houseColor,nickname,allergies,medicalNotes,photoUrl,coinsBalance,totalAttendance`;
  const exampleCsv = `kid001,Liam,Smith,2018-05-12,Male,family@email.com,Emma Smith,1112223333,John Smith,4445556666,explorer,Blue,Li,,,https://example.com/photo.jpg,100,5`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          Import Kids
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Kids Data</DialogTitle>
          <DialogDescription>
            Paste CSV data below. Header row is not required. The `id` is optional and can be left blank to auto-generate.
            <br />
            <strong>Required format:</strong>
            <code className="my-2 block rounded bg-muted p-2 text-xs text-foreground break-all whitespace-pre-wrap">
              {csvHeaders}
            </code>
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

        {importErrors.length > 0 && (
            <Alert variant="destructive">
                <AlertTitle>Please Fix the Following Errors</AlertTitle>
                <AlertDescription>
                    <ScrollArea className="h-32 mt-2">
                        <ul className="space-y-1 text-xs">
                            {importErrors.map((err, index) => (
                                <li key={index}>
                                    <strong>Line {err.line}:</strong> {err.error}
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </AlertDescription>
            </Alert>
        )}

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
