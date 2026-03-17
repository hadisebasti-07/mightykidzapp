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
  role: 'Admin' | 'Volunteer' | 'Leader';
  availability?: string[];
  skills?: string[];
  createdAt: string;
};

export type RecentActivity = {
  id: string;
  type: 'check-in' | 'redemption';
  kidName: string;
  details: string;
  timestamp: string;
  icon: React.ElementType;
  photoUrl?: string;
};

export type DashboardStats = {
  totalKids: number;
  kidsCheckedIn: number;
  thisMonthsBirthdays: number;
  totalGiftStock: number;
};

export const attendanceData = [
  { date: 'Week 1', attendance: 250 },
  { date: 'Week 2', attendance: 260 },
  { date: 'Week 3', attendance: 240 },
  { date: 'Week 4', attendance: 280 },
  { date: 'Week 5', attendance: 290 },
  { date: 'Week 6', attendance: 270 },
  { date: 'Week 7', attendance: 300 },
  { date: 'Week 8', attendance: 310 },
];

export const chartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
} as const;
