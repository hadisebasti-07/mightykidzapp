'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Camera, UserCircle2, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { addGift, updateGift } from '@/lib/data';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Gift } from '@/lib/types';
import { giftFormSchema, type GiftFormValues } from '@/lib/schemas';

export function GiftForm({ giftToEdit }: { giftToEdit?: Gift }) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<GiftFormValues> = giftToEdit
    ? {
        ...giftToEdit,
        photoDataUrl: giftToEdit.imageUrl,
      }
    : {
        name: '',
        description: '',
        coinCost: 100,
        stock: 10,
        active: true,
        photoDataUrl: '',
      };

  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoValue = form.watch('photoDataUrl');

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOpen]);

  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL('image/jpeg');
    form.setValue('photoDataUrl', dataUrl, { shouldValidate: true });
    setCameraOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoDataUrl', reader.result as string, {
          shouldValidate: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: GiftFormValues) {
    try {
      if (giftToEdit) {
        await updateGift(giftToEdit.id, data);
        toast({
          title: 'Gift Updated',
          description: `The gift "${data.name}" has been updated.`,
        });
        router.push('/store/manage');
      } else {
        await addGift(data);
        toast({
          title: 'Gift Created',
          description: `The gift "${data.name}" has been added to the store.`,
        });
        router.push('/store/manage');
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: giftToEdit ? 'Update Failed' : 'Creation Failed',
        description: e.message || 'An unexpected error occurred.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="photoDataUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-4">
              <FormLabel className="text-base font-semibold">
                Gift Image
              </FormLabel>
              <Avatar className="h-32 w-32 rounded-md border-4 border-muted">
                <AvatarImage
                  src={field.value}
                  alt="Gift image"
                  className="object-cover"
                />
                <AvatarFallback className="bg-background rounded-md">
                  <UserCircle2 className="h-24 w-24 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Camera className="mr-2" />
                      Take Photo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Take Gift Photo</DialogTitle>
                      <DialogDescription>
                        Position the gift in the frame and click the button
                        below.
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
                      <Alert
                        variant={
                          hasCameraPermission === false
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {hasCameraPermission === false ? (
                          <CameraOff />
                        ) : (
                          <Camera />
                        )}
                        <AlertTitle>
                          {hasCameraPermission === false
                            ? 'Camera Access Denied'
                            : 'Camera Access Required'}
                        </AlertTitle>
                        <AlertDescription>
                          {hasCameraPermission === false
                            ? 'Please allow camera access in your browser settings to take a photo.'
                            : 'Requesting camera permission...'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gift Name</FormLabel>
              <FormControl>
                <Input placeholder="Super Sparkle Sticker Pack" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A pack of 50 glittery and fun stickers."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="coinCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coin Cost</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active in Store</FormLabel>
                <FormDescription>
                  If checked, this gift will be visible to users in the store.
                </FormDescription>
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit">
            {giftToEdit ? 'Save Changes' : 'Create Gift'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
