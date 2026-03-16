'use client';

import { db } from './firebase/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, getDoc, updateDoc, deleteDoc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import type { Kid, Gift, Volunteer, RecentActivity, DashboardStats } from './types';
import { UserCheck, Gift as GiftIcon } from 'lucide-react';
import { z } from 'zod';

const kidFormSchema = z.object({
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
type KidFormValues = z.infer<typeof kidFormSchema>;


const giftFormSchema = z.object({
    name: z.string().min(2, { message: 'Gift name must be at least 2 characters.' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
    coinCost: z.coerce.number().int().positive({ message: 'Coin cost must be a positive number.' }),
    stock: z.coerce.number().int().min(0, { message: 'Stock cannot be negative.' }),
    active: z.boolean().default(true),
    photoDataUrl: z.string().optional(),
});
export type GiftFormValues = z.infer<typeof giftFormSchema>;


// This function now saves a new kid to the 'kids' collection in Firestore.
export const addKid = async (data: KidFormValues) => {
  const birthDate = data.dateOfBirth;

  // 1. Create a new doc ref with an auto-generated ID
  const newKidRef = doc(collection(db, 'kids'));

  // 2. Create the data object, including the new ID to satisfy security rules
  const newKidData = {
    id: newKidRef.id, // This is required by your firestore.rules
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname || '',
    dateOfBirth: birthDate.toISOString().split('T')[0],
    gender: data.gender,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    allergies: data.allergies || '',
    medicalNotes: data.medicalNotes || '',
    photoUrl: data.photoDataUrl || `https://picsum.photos/seed/${data.firstName}${data.lastName}/400/400`,
    coinsBalance: 0,
    totalAttendance: 0,
    birthdayMonth: birthDate.getMonth() + 1,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newKidRef, newKidData);
  } catch (e) {
    console.error("data.ts (addKid): Error adding document: ", e);
    throw e;
  }
};

// This function now fetches all kids from the 'kids' collection in Firestore.
export const getKids = async (): Promise<Kid[]> => {
  const kidsCol = collection(db, 'kids');
  const q = query(kidsCol, orderBy('createdAt', 'desc'));
  const kidsSnapshot = await getDocs(q);
  const kidsList = kidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kid));
  return kidsList;
};

export const getKidById = async (kidId: string): Promise<Kid | null> => {
  const kidRef = doc(db, 'kids', kidId);
  const kidSnap = await getDoc(kidRef);

  if (kidSnap.exists()) {
    return { id: kidSnap.id, ...kidSnap.data() } as Kid;
  } else {
    return null;
  }
};


export const updateKid = async (kidId: string, data: Partial<KidFormValues>) => {
  const kidRef = doc(db, 'kids', kidId);
  
  const updateData: any = { ...data };
  if (data.dateOfBirth) {
    updateData.dateOfBirth = data.dateOfBirth.toISOString().split('T')[0];
    updateData.birthdayMonth = data.dateOfBirth.getMonth() + 1;
  }

  if (data.photoDataUrl) {
    updateData.photoUrl = data.photoDataUrl;
  }
  delete updateData.photoDataUrl;

  try {
    await updateDoc(kidRef, updateData);
  } catch (e) {
    console.error(`data.ts (updateKid): Error updating document with ID ${kidId}: `, e);
    throw e;
  }
};

export const deleteKid = async (kidId: string) => {
  try {
    const kidRef = doc(db, 'kids', kidId);
    await deleteDoc(kidRef);
  } catch (e) {
    console.error(`data.ts (deleteKid): Error deleting document with ID ${kidId}: `, e);
    throw e;
  }
};

export const checkInKid = async (kidId: string) => {
  const kidRef = doc(db, 'kids', kidId);
  try {
    // Atomically increment the coins balance and attendance count.
    await updateDoc(kidRef, {
      coinsBalance: increment(10),
      totalAttendance: increment(1)
    });
  } catch (e) {
    console.error(`data.ts (checkInKid): Error updating document with ID ${kidId}: `, e);
    throw e;
  }
};


// GIFT MANAGEMENT
export const getGifts = async (): Promise<Gift[]> => {
    const giftsCol = collection(db, 'gifts');
    const q = query(giftsCol, orderBy('createdAt', 'desc'));
    const giftsSnapshot = await getDocs(q);
    const giftsList = giftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift));
    return giftsList;
};

export const getGiftById = async (giftId: string): Promise<Gift | null> => {
    const giftRef = doc(db, 'gifts', giftId);
    const giftSnap = await getDoc(giftRef);
    if (giftSnap.exists()) {
        return { id: giftSnap.id, ...giftSnap.data() } as Gift;
    }
    return null;
};

export const addGift = async (data: GiftFormValues) => {
    const newGiftRef = doc(collection(db, 'gifts'));
    const newGiftData = {
        ...data,
        id: newGiftRef.id,
        imageUrl: data.photoDataUrl || `https://picsum.photos/seed/${data.name}/600/400`,
        createdAt: new Date().toISOString(),
    };
    delete (newGiftData as any).photoDataUrl;

    try {
        await setDoc(newGiftRef, newGiftData);
    } catch(e) {
        console.error("data.ts (addGift): Error adding document: ", e);
        throw e;
    }
};

export const updateGift = async (giftId: string, data: Partial<GiftFormValues>) => {
    const giftRef = doc(db, 'gifts', giftId);
    const updateData: any = { ...data };
    if (data.photoDataUrl) {
        updateData.imageUrl = data.photoDataUrl;
    }
    delete updateData.photoDataUrl;

    try {
        await updateDoc(giftRef, updateData);
    } catch (e) {
        console.error(`data.ts (updateGift): Error updating document with ID ${giftId}: `, e);
        throw e;
    }
};

export const deleteGift = async (giftId: string) => {
    try {
        const giftRef = doc(db, 'gifts', giftId);
        await deleteDoc(giftRef);
    } catch (e) {
        console.error(`data.ts (deleteGift): Error deleting document with ID ${giftId}: `, e);
        throw e;
    }
};

export const redeemGift = async (kidId: string, giftId: string) => {
  const kidRef = doc(db, 'kids', kidId);
  const giftRef = doc(db, 'gifts', giftId);
  const redemptionRef = doc(collection(db, 'kids', kidId, 'redemptions'));

  try {
    await runTransaction(db, async (transaction) => {
      const kidDoc = await transaction.get(kidRef);
      const giftDoc = await transaction.get(giftRef);

      if (!kidDoc.exists() || !giftDoc.exists()) {
        throw new Error("Kid or Gift not found!");
      }

      const kidData = kidDoc.data();
      const giftData = giftDoc.data();

      if (kidData.coinsBalance < giftData.coinCost) {
        throw new Error("Not enough coins!");
      }

      if (giftData.stock <= 0) {
        throw new Error("Gift is out of stock!");
      }

      // Perform the updates
      transaction.update(kidRef, {
        coinsBalance: increment(-giftData.coinCost)
      });
      transaction.update(giftRef, {
        stock: increment(-1)
      });

      // Create a redemption record
      transaction.set(redemptionRef, {
        id: redemptionRef.id,
        kidId: kidId,
        giftId: giftId,
        giftName: giftData.name,
        coinCost: giftData.coinCost,
        redeemedAt: serverTimestamp(),
      });
    });

  } catch (e) {
    console.error("data.ts (redeemGift): Transaction failed: ", e);
    throw e;
  }
};


export const volunteers: Volunteer[] = [
  {
    id: 'v1',
    name: 'Jessica Day',
    phone: '123-456-7890',
    email: 'jessica.day@example.com',
    role: 'Admin',
  },
  {
    id: 'v2',
    name: 'Mark Johnson',
    phone: '234-567-8901',
    email: 'mark.j@example.com',
    role: 'Leader',
  },
  {
    id: 'v3',
    name: 'Sarah Lee',
    phone: '345-678-9012',
    email: 'sarah.lee@example.com',
    role: 'Volunteer',
  },
  {
    id: 'v4',
    name: 'David Chen',
    phone: '456-789-0123',
    email: 'david.c@example.com',
    role: 'Volunteer',
  },
  {
    id: 'v5',
    name: 'Emily White',
    phone: '567-890-1234',
    email: 'emily.w@example.com',
    role: 'Volunteer',
  },
];

export const getVolunteers = (): Volunteer[] => volunteers;

export const getRecentActivities = (): RecentActivity[] => [
  {
    id: 'ra1',
    type: 'check-in',
    kidName: 'Liam Smith',
    details: 'Checked into Nursery',
    timestamp: '2 mins ago',
    icon: UserCheck,
  },
  {
    id: 'ra2',
    type: 'check-in',
    kidName: 'Emma Brown',
    details: 'Checked into Preschool',
    timestamp: '5 mins ago',
    icon: UserCheck,
  },
  {
    id: 'ra3',
    type: 'redemption',
    kidName: 'Olivia Jones',
    details: 'Redeemed Bouncy Ball Bonanza',
    timestamp: '10 mins ago',
    icon: GiftIcon,
  },
  {
    id: 'ra4',
    type: 'check-in',
    kidName: 'Sophia Miller',
    details: 'Checked into Elementary',
    timestamp: '12 mins ago',
    icon: UserCheck,
  },
];

export const getDashboardStats = (): DashboardStats => ({
  kidsCheckedIn: 284,
  volunteersOnDuty: 18,
  todaysBirthdays: 2,
  giftsRedeemed: 12,
});
