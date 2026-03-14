import { db } from './firebase/auth';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import type { Kid, Gift, Volunteer, RecentActivity, DashboardStats } from './types';
import { UserCheck, Gift as GiftIcon } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

// This function now saves a new kid to the 'kids' collection in Firestore.
export const addKid = async (data: {
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female';
  parentName: string;
  parentPhone: string;
  allergies?: string;
  medicalNotes?: string;
}) => {
  const birthDate = data.dateOfBirth;

  const newKidData = {
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname || '',
    dateOfBirth: birthDate.toISOString().split('T')[0],
    gender: data.gender,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    allergies: data.allergies || '',
    medicalNotes: data.medicalNotes || '',
    photoUrl: `https://picsum.photos/seed/${data.firstName}${data.lastName}/400/400`,
    coinsBalance: 0,
    totalAttendance: 0,
    birthdayMonth: birthDate.getMonth() + 1,
    createdAt: new Date().toISOString(), // Use full ISO string for sorting
  };

  console.log('data.ts (addKid): Writing to Firestore with data:', newKidData);
  try {
    const docRef = await addDoc(collection(db, 'kids'), newKidData);
    console.log('data.ts (addKid): Document written with ID: ', docRef.id);
  } catch (e) {
    console.error("data.ts (addKid): Error adding document: ", e);
  }
};

// This function now fetches all kids from the 'kids' collection in Firestore.
export const getKids = async (): Promise<Kid[]> => {
  const kidsCol = collection(db, 'kids');
  const q = query(kidsCol, orderBy('createdAt', 'desc')); // Order by creation date, newest first
  const kidsSnapshot = await getDocs(q);
  const kidsList = kidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Kid));
  return kidsList;
};

export const gifts: Gift[] = [
  {
    id: 'g1',
    name: 'Super Sparkle Sticker Pack',
    description: 'A pack of 50 glittery and fun stickers.',
    coinCost: 50,
    imageUrl: PlaceHolderImages.find(p => p.id === 'gift1')?.imageUrl || '',
    stock: 100,
    active: true,
  },
  {
    id: 'g2',
    name: 'Bouncy Ball Bonanza',
    description: 'A super bouncy ball with bright colors.',
    coinCost: 75,
    imageUrl: PlaceHolderImages.find(p => p.id === 'gift2')?.imageUrl || '',
    stock: 50,
    active: true,
  },
  {
    id: 'g3',
    name: 'Kingdom Builders Lego Set',
    description: 'Small Lego set to build a cool castle.',
    coinCost: 200,
    imageUrl: PlaceHolderImages.find(p => p.id === 'gift3')?.imageUrl || '',
    stock: 20,
    active: true,
  },
  {
    id: 'g4',
    name: 'Glow-in-the-Dark Stars',
    description: 'Decorate your room with these awesome stars.',
    coinCost: 120,
    imageUrl: PlaceHolderImages.find(p => p.id === 'gift4')?.imageUrl || '',
    stock: 40,
    active: true,
  },
  {
    id: 'g5',
    name: 'Candy Surprise Bag',
    description: 'A small bag filled with yummy candy.',
    coinCost: 100,
    imageUrl: PlaceHolderImages.find(p => p.id === 'gift5')?.imageUrl || '',
    stock: 80,
    active: true,
  },
  {
    id: 'g6',
    name: 'WonderKids T-Shirt',
    description: 'A cool t-shirt with the WonderKids logo!',
    coinCost: 500,
    imageUrl: PlaceHolderImages.find(p => p.id === 'gift6')?.imageUrl || '',
    stock: 15,
    active: false,
  },
];

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

export const getGifts = (): Gift[] => gifts;
export const getGiftById = (id: string): Gift | undefined =>
  gifts.find((g) => g.id === id);

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
