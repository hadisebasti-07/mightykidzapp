'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';

const kidFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  nickname: z.string().optional(),
  dateOfBirth: z.date({
    required_error: "A date of birth is required.",
  }),
  gender: z.enum(['Male', 'Female']),
  parentName: z.string().min(2, { message: 'Parent name is required.' }),
  parentPhone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
});

type KidFormValues = z.infer<typeof kidFormSchema>;

const defaultValues: Partial<KidFormValues> = {
  firstName: '',
  lastName: '',
  nickname: '',
  gender: 'Male',
  parentName: '',
  parentPhone: '',
  allergies: '',
  medicalNotes: '',
};

export function KidForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<KidFormValues>({
    resolver: zodResolver(kidFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  function onSubmit(data: KidFormValues) {
    toast({
      title: 'Kid Profile Created',
      description: `The profile for ${data.firstName} ${data.lastName} has been created.`,
    });
    // In a real app, you would save the data to a database here.
    console.log('New kid data:', data);
    router.push('/kids');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
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
          <Button type="submit">Create Kid Profile</Button>
        </div>
      </form>
    </Form>
  );
}
