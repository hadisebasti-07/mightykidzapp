'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Camera, UserCircle2, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { addKid, updateKid } from '@/lib/data';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Kid } from '@/lib/types';
import { kidFormSchema, type KidFormValues } from '@/lib/schemas';

// Helper to parse YYYY-MM-DD string into a Date, ignoring timezones.
const parseDateString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function KidForm({ kidToEdit }: { kidToEdit?: Kid }) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<KidFormValues> = kidToEdit ? {
      ...kidToEdit,
      photoDataUrl: kidToEdit.photoUrl,
      dateOfBirth: parseDateString(kidToEdit.dateOfBirth),
  } : {
      photoDataUrl: '',
      firstName: '',
      lastName: '',
      nickname: '',
      gender: 'Male',
      parentName: '',
      parentPhone: '',
      allergies: '',
      medicalNotes: '',
      className: undefined,
      houseColor: undefined,
  };

  const form = useForm<KidFormValues>({
    resolver: zodResolver(kidFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoValue = form.watch('photoDataUrl');

  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  async function onSubmit(data: KidFormValues) {
    try {
      if (kidToEdit) {
        await updateKid(kidToEdit.id, data);
        toast({
          title: 'Kid Profile Updated',
          description: `The profile for ${data.firstName} ${data.lastName} has been updated.`,
        });
        router.push('/kids');
      } else {
        await addKid(data);
        toast({
          title: 'Kid Profile Created',
          description: `The profile for ${data.firstName} ${data.lastName} has been created.`,
        });
        router.push('/kids');
      }
    } catch(e: any) {
        toast({
            variant: 'destructive',
            title: kidToEdit ? 'Update Failed' : 'Creation Failed',
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
              <FormLabel className="text-base font-semibold">Profile Photo</FormLabel>
              <Avatar className="h-32 w-32 border-4 border-muted">
                <AvatarImage src={field.value} alt="Kid's photo" />
                <AvatarFallback className="bg-background">
                  <UserCircle2 className="h-24 w-24 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
              <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Camera className="mr-2" />
                    {photoValue ? 'Retake Photo' : 'Take Photo'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {hasCameraPermission === true ? (
                    <div className="flex flex-col gap-4">
                      <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay playsInline muted />
                      <Button type="button" onClick={handleTakePhoto}>Take Picture</Button>
                    </div>
                  ) : (
                    <Alert variant={hasCameraPermission === false ? "destructive" : "default"}>
                       {hasCameraPermission === false ? <CameraOff /> : <Camera />}
                      <AlertTitle>{hasCameraPermission === false ? 'Camera Access Denied' : 'Camera Access Required'}</AlertTitle>
                      <AlertDescription>
                        {hasCameraPermission === false
                          ? 'Please allow camera access in your browser settings to take a photo.'
                          : 'Requesting camera permission...'}
                      </AlertDescription>
                    </Alert>
                  )}
                </DialogContent>
              </Dialog>
              <FormMessage />
            </FormItem>
          )}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Liam" {...field} />
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
                    <Input placeholder="Smith" {...field} />
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
                <Input placeholder="Li" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear() - 18}
                      toYear={new Date().getFullYear()}
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                    </PopoverContent>
                  </Popover>
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
                        <SelectValue placeholder="Select a gender" />
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="discoverer">Discoverer</SelectItem>
                      <SelectItem value="explorer">Explorer</SelectItem>
                      <SelectItem value="adventurer">Adventurer</SelectItem>
                      <SelectItem value="warrior">Warrior</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="houseColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a house color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Yellow">Yellow</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
         <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FormField
            control={form.control}
            name="parentName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Parent's Name</FormLabel>
                <FormControl>
                    <Input placeholder="Emma Smith" {...field} />
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
                <FormLabel>Parent's Phone</FormLabel>
                <FormControl>
                    <Input placeholder="111-222-3333" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Allergies (Optional)</FormLabel>
                <FormControl>
                <Textarea placeholder="Peanuts, gluten, etc." {...field} />
                </FormControl>
                <FormDescription>
                    List any known allergies.
                </FormDescription>
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
                <Textarea placeholder="Asthma, etc." {...field} />
                </FormControl>
                 <FormDescription>
                    List any important medical information.
                </FormDescription>
                <FormMessage />
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
          <Button type="submit">{kidToEdit ? 'Save Changes' : 'Create Kid Profile'}</Button>
        </div>
      </form>
    </Form>
  );
}
