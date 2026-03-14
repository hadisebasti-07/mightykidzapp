import { Kid, Gift, Volunteer, RecentActivity, DashboardStats } from './types';
import { UserCheck, Gift as GiftIcon } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

export const kids: Kid[] = [
  {
    id: 'k1',
    firstName: 'Liam',
    lastName: 'Smith',
    nickname: 'Li',
    dateOfBirth: '2018-05-15',
    gender: 'Male',
    parentName: 'Emma Smith',
    parentPhone: '111-222-3333',
    photoUrl: PlaceHolderImages.find(p => p.id === 'kid1')?.imageUrl || '',
    coinsBalance: 150,
    totalAttendance: 45,
    birthdayMonth: 5,
    createdAt: '2022-01-10',
    allergies: 'Peanuts',
  },
  {
    id: 'k2',
    firstName: 'Olivia',
    lastName: 'Jones',
    dateOfBirth: '2019-09-20',
    gender: 'Female',
    parentName: 'Noah Jones',
    parentPhone: '222-333-4444',
    photoUrl: PlaceHolderImages.find(p => p.id === 'kid2')?.imageUrl || '',
    coinsBalance: 200,
    totalAttendance: 50,
    birthdayMonth: 9,
    createdAt: '2022-02-15',
  },
  {
    id: 'k3',
    firstName: 'Noah',
    lastName: 'Williams',
    dateOfBirth: '2017-07-11',
    gender: 'Male',
    parentName: 'Ava Williams',
    parentPhone: '333-444-5555',
    photoUrl: PlaceHolderImages.find(p => p.id === 'kid3')?.imageUrl || '',
    coinsBalance: 120,
    totalAttendance: 38,
    birthdayMonth: 7,
    createdAt: '2021-11-20',
  },
  {
    id: 'k4',
    firstName: 'Emma',
    lastName: 'Brown',
    nickname: 'Em',
    dateOfBirth: '2020-02-25',
    gender: 'Female',
    parentName: 'James Brown',
    parentPhone: '444-555-6666',
    photoUrl: PlaceHolderImages.find(p => p.id === 'kid4')?.imageUrl || '',
    coinsBalance: 300,
    totalAttendance: 60,
    birthdayMonth: 2,
    createdAt: '2023-03-01',
    medicalNotes: 'Asthma',
  },
  {
    id: 'k5',
    firstName: 'James',
    lastName: 'Davis',
    dateOfBirth: '2018-11-30',
    gender: 'Male',
    parentName: 'Sophia Davis',
    parentPhone: '555-666-7777',
    photoUrl: PlaceHolderImages.find(p => p.id === 'kid5')?.imageUrl || '',
    coinsBalance: 80,
    totalAttendance: 30,
    birthdayMonth: 11,
    createdAt: '2022-08-12',
  },
  {
    id: 'k6',
    firstName: 'Sophia',
    lastName: 'Miller',
    dateOfBirth: '2019-04-05',
    gender: 'Female',
    parentName: 'Benjamin Miller',
    parentPhone: '666-777-8888',
    photoUrl: PlaceHolderImages.find(p => p.id === 'kid6')?.imageUrl || '',
    coinsBalance: 250,
    totalAttendance: 55,
    birthdayMonth: 4,
    createdAt: '2022-09-18',
  },
];

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

export const addKid = (data: {
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
  const newId = `k${Date.now()}`;
  const birthDate = data.dateOfBirth;

  const newKid: Kid = {
    id: newId,
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname || '',
    dateOfBirth: birthDate.toISOString().split('T')[0],
    gender: data.gender,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    allergies: data.allergies || '',
    medicalNotes: data.medicalNotes || '',
    photoUrl: `https://picsum.photos/seed/${newId}/400/400`,
    coinsBalance: 0,
    totalAttendance: 0,
    birthdayMonth: birthDate.getMonth() + 1,
    createdAt: new Date().toISOString().split('T')[0],
  };

  kids.unshift(newKid);
};

export const getKids = (): Kid[] => kids;
export const getKidById = (id: string): Kid | undefined =>
  kids.find((k) => k.id === id);

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
