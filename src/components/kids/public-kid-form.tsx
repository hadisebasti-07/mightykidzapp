'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useRef, useEffect } from 'react';
import { addKidPublic } from '@/lib/data';
import { publicKidRegistrationSchema, type PublicKidRegistrationValues } from '@/lib/schemas';

export function PublicKidForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const form = useForm<PublicKidRegistrationValues>({
    resolver: zodResolver(publicKidRegistrationSchema),
    defaultValues: {
      photoDataUrl: '',
      firstName: '',
      lastName: '',
      nickname: '',
      dateOfBirth: '',
      gender: 'Male',
      parentName: '',
      parentPhone: '',
      allergies: '',
      medicalNotes: '',
    },
    mode: 'onChange',
  });

  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoValue = form.watch('photoDataUrl');

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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    form.setValue('photoDataUrl', canvas.toDataURL('image/jpeg', 0.7), { shouldValidate: true });
    setCameraOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('photoDataUrl', reader.result as string, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(data: PublicKidRegistrationValues) {
    try {
      await addKidPublic(data);
      onSuccess();
    } catch (e: unknown) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: e instanceof Error ? e.message : 'An unexpected error occurred.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Photo */}
        <FormField
          control={form.control}
          name="photoDataUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-4">
              <FormLabel className="text-base font-semibold">Profile Photo (Optional)</FormLabel>
              <Avatar className="h-32 w-32 border-4 border-muted">
                <AvatarImage src={field.value} alt="Child's photo" />
                <AvatarFallback className="bg-background">
                  <UserCircle2 className="h-24 w-24 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      {photoValue ? 'Retake Photo' : 'Take Photo'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Take a Photo</DialogTitle>
                      <DialogDescription>
                        Position the child in the frame and click the button below.
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
                          {hasCameraPermission === false ? 'Camera Access Denied' : 'Camera Access Required'}
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
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        <canvas ref={canvasRef} className="hidden" />

        {/* Name */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Liam" maxLength={50} {...field} />
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
                  <Input placeholder="Smith" maxLength={50} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Li" maxLength={30} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DOB + Gender */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Child must be between 0–18 years old.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parent info */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="parentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent / Guardian Name</FormLabel>
                <FormControl>
                  <Input placeholder="Emma Smith" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent / Guardian Phone</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" maxLength={20} {...field} />
                </FormControl>
                <FormDescription>Digits only, 8–15 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Medical */}
        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Peanuts, gluten, etc." maxLength={500} {...field} />
              </FormControl>
              <FormDescription>Max 500 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="medicalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Asthma, etc." maxLength={1000} {...field} />
              </FormControl>
              <FormDescription>Max 1000 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting…' : 'Register Child'}
        </Button>
      </form>
    </Form>
  );
}
