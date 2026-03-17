import { z } from 'zod';

export const kidFormSchema = z.object({
  photoDataUrl: z.string().optional(),
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

export type KidFormValues = z.infer<typeof kidFormSchema>;

export const giftFormSchema = z.object({
    name: z.string().min(2, { message: 'Gift name must be at least 2 characters.' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    coinCost: z.coerce.number().int().positive({ message: 'Coin cost must be a positive number.' }),
    stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative.' }),
    active: z.boolean().default(true),
    photoDataUrl: z.string().optional(),
});
export type GiftFormValues = z.infer<typeof giftFormSchema>;
