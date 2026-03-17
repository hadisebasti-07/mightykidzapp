'use client';
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
  className: z.enum(['discoverer', 'explorer', 'adventurer', 'warrior'], {
    required_error: "You need to select a class.",
  }),
  houseColor: z.enum(['Red', 'Green', 'Blue', 'Yellow']).optional(),
  parentName: z.string().min(2, { message: 'Parent name is required.' }),
  parentPhone: z.string().length(8, { message: 'Phone number must be 8 digits.' }),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export type KidFormValues = z.infer<typeof kidFormSchema>;


export const kidImportSchema = z.object({
  id: z.string().optional().or(z.literal('')),
  firstName: z.string().min(1, { message: 'firstName is required' }),
  lastName: z.string().min(1, { message: 'lastName is required' }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  gender: z.enum(['Male', 'Female']),
  parentName: z.string().min(1, { message: 'parentName is required' }),
  parentPhone: z.string().length(8, { message: 'Phone number must be 8 digits.' }),
  className: z.enum(['discoverer', 'explorer', 'adventurer', 'warrior']),
  houseColor: z.enum(['Red', 'Green', 'Blue', 'Yellow']).optional().or(z.literal('')),
  nickname: z.string().optional(),
  allergies: z.string().optional(),
  medicalNotes: z.string().optional(),
  photoUrl: z.string().url({ message: 'Invalid photo URL' }).optional().or(z.literal('')),
  coinsBalance: z.coerce.number().int().default(0),
  totalAttendance: z.coerce.number().int().default(0),
});
export type KidImportValues = z.infer<typeof kidImportSchema>;


export const giftFormSchema = z.object({
    name: z.string().min(2, { message: 'Gift name must be at least 2 characters.' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    coinCost: z.coerce.number().int().positive({ message: 'Coin cost must be a positive number.' }),
    stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative.' }),
    active: z.boolean().default(true),
    photoDataUrl: z.string().optional(),
});
export type GiftFormValues = z.infer<typeof giftFormSchema>;