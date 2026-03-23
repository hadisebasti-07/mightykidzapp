
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Camera, UserCircle2, CameraOff, Info } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { addKid, updateKid, submitPublicRegistration } from '@/lib/data';
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
import { Kid } from '@/lib/types';
import { kidFormSchema, type KidFormValues } from '@/lib/schemas';


export function KidForm({ kidToEdit, isPublic = false }: { kidToEdit?: Kid, isPublic?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: Partial<KidFormValues> = kidToEdit
    ? {
        ...kidToEdit,
        photoDataUrl: kidToEdit.photoUrl,
      }
    : {
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
        className: undefined,
        houseColor: undefined,
        coinsBalance: 0,
      };

  const form = useForm<KidFormValues>({
    resolver: zodResolver(kidFormSchema),
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
    let stream: MediaStream | null = null;

    const getCamera = async () => {
      if (isCameraOpen) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error(
            'Error accessing back camera, trying any camera as fallback:',
            error
          );
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (fallbackError) {
            console.error('Error accessing any camera:', fallbackError);
            setHasCameraPermission(false);
          }
        }
      }
    };

    getCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
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
            form.setValue('photoDataUrl', reader.result as string, { shouldValidate: true });
        };
        reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: KidFormValues) {
    if (!isPublic && !data.className) {
      form.setError("className", { type: "manual", message: "Class is a required field for admins." });
      return;
    }
    
    if (isPublic) {
      try {
        await submitPublicRegistration(data);
        router.push('/register/success');
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: e.message || 'An unexpected error occurred. Please try again.',
        });
      }
      return;
    }

    // Admin logic
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
    } catch (e: any) {
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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Purpose Statement</AlertTitle>
          <AlertDescription>
            We collect this data to ensure your child's safety and to manage class activities. By submitting this form, you consent to our use of this data for ministry purposes.
          </AlertDescription>
        </Alert>
        
        <FormField
          control={form.control}
          name="photoDataUrl"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center gap-4">
              <FormLabel className="text-base font-semibold">
                Profile Photo
              </FormLabel>
              <Avatar className="h-32 w-32 border-4 border-muted">
                <AvatarImage src={field.value} alt="Kid's photo" />
                <AvatarFallback className="bg-background">
                  <UserCircle2 className="h-24 w-24 text-muted-foreground/50" />
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Dialog open={isCameraOpen} onOpenChange={setCameraOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      <Camera className="mr-2" />
                      {photoValue ? 'Retake Photo' : 'Take Photo'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Take a Photo</DialogTitle>
                      <DialogDescription>
                        Position the child in the frame and click the button
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
                        {hasCameraPermission === false ? <CameraOff /> : <Camera />}
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
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY-MM-DD" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use YYYY-MM-DD format.
                  </FormDescription>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
        {!isPublic && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
        )}

        {!isPublic && kidToEdit && (
            <FormField
              control={form.control}
              name="coinsBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coins Balance</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Manually adjust the total number of coins for this child.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        
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
                  <Input placeholder="12345678" {...field} />
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
              <FormDescription>List any known allergies.</FormDescription>
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
            onClick={() => isPublic ? router.push('/login') : router.back()}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isPublic ? 'Submit Registration' : (kidToEdit ? 'Save Changes' : 'Create Kid Profile')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
