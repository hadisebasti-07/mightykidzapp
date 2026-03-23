'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { addVolunteer } from '@/lib/data';

const volunteerFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  role: z.enum(['Admin', 'Leader', 'Volunteer', 'Welcome IC']),
});

type VolunteerFormValues = z.infer<typeof volunteerFormSchema>;

const defaultValues: Partial<VolunteerFormValues> = {
  role: 'Volunteer',
};

export function VolunteerForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: VolunteerFormValues) {
    try {
      await addVolunteer(data);
      toast({
        title: 'Volunteer Profile Created',
        description: `The profile for ${data.name} has been created.`,
      });
      router.push('/volunteers');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the volunteer profile.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jessica Day" {...field} />
              </FormControl>
              <FormDescription>
                This is the volunteer's full name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="jessica.day@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The volunteer's contact email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="123-456-7890" {...field} />
              </FormControl>
              <FormDescription>
                The volunteer's contact phone number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Volunteer">Volunteer</SelectItem>
                  <SelectItem value="Leader">Leader</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Welcome IC">Welcome IC</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Assign a role to the volunteer to manage their permissions.
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
          <Button type="submit">Create Volunteer</Button>
        </div>
      </form>
    </Form>
  );
}
