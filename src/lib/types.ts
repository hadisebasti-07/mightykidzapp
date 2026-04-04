export type Kid = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentName: string;
  parentPhone: string;
  allergies?: string;
  medicalNotes?: string;
  photoUrl: string;
  coinsBalance: number;
  totalAttendance: number;
  birthdayMonth: number;
  createdAt: string;
  className?: string;
  houseColor?: string;
};

export type Gift = {
  id: string;
  name: string;
  description: string;
  coinCost: number;
  imageUrl: string;
  stock: number;
  active: boolean;
  createdAt: string;
};

export type Volunteer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'Admin' | 'Volunteer' | 'Leader' | 'Welcome IC';
  availability?: string[];
  skills?: string[];
  createdAt: string;
};

export type RecentActivity = {
  id: string;
  type: 'check-in' | 'redemption';
  kidId: string;
  kidName: string;
  details: string;
  timestamp: string;
  photoUrl?: string;
};

export type DashboardStats = {
  totalKids: number;
  kidsCheckedIn: number;
  thisMonthsBirthdays: number;
  totalGiftStock: number;
};

export type HouseScore = {
  id: string;       // 'red' | 'blue' | 'yellow' | 'green'
  color: string;
  points: number;
  updatedAt: string;
};

export const chartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
} as const;
