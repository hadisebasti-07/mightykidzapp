'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, ImageIcon, Loader2 } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { addLogisticsItem, updateLogisticsItem, getVolunteers } from '@/lib/data';
import { logisticsFormSchema, type LogisticsFormValues } from '@/lib/schemas';
import type { LogisticsItem, Volunteer } from '@/lib/types';

const CATEGORY_LABELS: Record<LogisticsItem['category'], string> = {
  costume: 'Costume',
  'game-equipment': 'Game Equipment',
  'skit-prop': 'Skit / Drama Prop',
  'craft-supply': 'Craft & Art Supply',
  decoration: 'Decoration & Backdrop',
  'av-tech': 'AV & Tech',
  'teaching-material': 'Teaching Material',
  consumable: 'Consumable',
  other: 'Other',
};

const CONDITION_LABELS: Record<LogisticsItem['condition'], string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  'needs-repair': 'Needs Repair',
};

interface LogisticsFormProps {
  item?: LogisticsItem;
}

export function LogisticsForm({ item }: LogisticsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!item;

  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getVolunteers().then(setVolunteers);
  }, []);

  const form = useForm<LogisticsFormValues>({
    resolver: zodResolver(logisticsFormSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || '',
          category: item.category,
          quantity: item.quantity,
          condition: item.condition,
          location: item.location || '',
          notes: item.notes || '',
          photoDataUrl: item.photoUrl || '',
          expiryDate: item.expiryDate || '',
          purchaseDate: item.purchaseDate || '',
          purchaseCost: item.purchaseCost ?? undefined,
          supplier: item.supplier || '',
          reorderLink: item.reorderLink || '',
          lastUsedFor: item.lastUsedFor || '',
          assignedTo: item.assignedTo || '',
        }
      : {
          name: '',
          description: '',
          category: 'other',
          quantity: 1,
          condition: 'good',
          location: '',
          notes: '',
          photoDataUrl: '',
          expiryDate: '',
          purchaseDate: '',
          purchaseCost: undefined,
          supplier: '',
          reorderLink: '',
          lastUsedFor: '',
          assignedTo: '',
        },
    mode: 'onChange',
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCamera = async () => {
      if (!isCameraOpen) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        setHasCameraPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
          setHasCameraPermission(false);
        }
      }
    };
    getCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isCameraOpen]);

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    form.setValue('photoDataUrl', canvas.toDataURL('image/jpeg'), { shouldValidate: true });
    setCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      form.setValue('photoDataUrl', reader.result as string, { shouldValidate: true });
    reader.readAsDataURL(file);
  };

  async function onSubmit(data: LogisticsFormValues) {
    try {
      if (isEditing) {
        await updateLogisticsItem(item.id, data);
        toast({ title: 'Item Updated', description: `${data.name} has been updated.` });
      } else {
        await addLogisticsItem(data);
        toast({ title: 'Item Added', description: `${data.name} has been added to logistics.` });
      }
      router.push('/logistics');
    } catch {
      toast({
        variant: 'destructive',
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        description: 'Could not save the logistics item.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Photo */}
        <FormField
          control={form.control}
          name="photoDataUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-4">
              <FormLabel className="text-base font-semibold">Photo</FormLabel>
              <Avatar className="h-32 w-32 rounded-md border-4 border-muted">
                <AvatarImage src={field.value} alt="Item photo" className="object-cover" />
                <AvatarFallback className="bg-background rounded-md">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Take Item Photo</DialogTitle>
                      <DialogDescription>
                        Position the item in the frame and click the button below.
                      </DialogDescription>
                    </DialogHeader>
                    {hasCameraPermission === true ? (
                      <div className="flex flex-col gap-4">
                        <video
                          ref={videoRef}
                          className="aspect-video w-full rounded-md bg-muted"
                          autoPlay
                          playsInline
                          muted
                        />
                        <Button type="button" onClick={handleTakePhoto}>
                          Take Picture
                        </Button>
                      </div>
                    ) : (
                      <Alert variant={hasCameraPermission === false ? 'destructive' : 'default'}>
                        {hasCameraPermission === false ? <CameraOff /> : <Camera />}
                        <AlertTitle>
                          {hasCameraPermission === false
                            ? 'Camera Access Denied'
                            : 'Camera Access Required'}
                        </AlertTitle>
                        <AlertDescription>
                          {hasCameraPermission === false
                            ? 'Please allow camera access in your browser settings.'
                            : 'Requesting camera permission...'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </DialogContent>
                </Dialog>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Upload Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <canvas ref={canvasRef} className="hidden" />

        <Separator />

        {/* Core details */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Red Dragon Costume" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.entries(CATEGORY_LABELS) as [LogisticsItem['category'], string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.entries(CONDITION_LABELS) as [LogisticsItem['condition'], string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Props Cabinet A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Tracking */}
        <p className="text-sm font-medium text-muted-foreground">Tracking</p>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || '__none__'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Not assigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">Not assigned</SelectItem>
                    {volunteers.map((v) => (
                      <SelectItem key={v.id} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastUsedFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Used For</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Christmas 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Cost</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Spotlight, Amazon SG" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Link</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" className="w-48" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Notes */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief description of the item..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
