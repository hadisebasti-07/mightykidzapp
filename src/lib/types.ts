export type Kid = {
  id: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  email?: string;
  parentName: string;
  parentPhone: string;
  parent2Name?: string;
  parent2Phone?: string;
  allergies?: string;
  medicalNotes?: string;
  photoUrl: string;
  coinsBalance: number;
  totalAttendance: number;
  birthdayMonth: number;
  createdAt: string;
  className?: string;
  houseColor?: string;
  barcode?: string;
  status?: 'regular' | 'irregular' | 'visitor' | 'guest' | 'graduated' | 'not_attending';
  firstVisitDate?: string;
  invitedBy?: string;
  tshirtIssued?: boolean;
  idCardIssued?: boolean;
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

export type AttendanceRecord = {
  id: string;
  kidId: string;
  kidName: string;
  timestamp: Date;
};

export type AttendanceReportRow = {
  kidId: string;
  firstName: string;
  lastName: string;
  className?: string;
  houseColor?: string;
  photoUrl: string;
  status?: string;
  attended: number;
  totalSessions: number;
  percentage: number;
};

export type LogisticsItem = {
  id: string;
  name: string;
  description?: string;
  category: 'costume' | 'game-equipment' | 'skit-prop' | 'craft-supply' | 'decoration' | 'av-tech' | 'teaching-material' | 'consumable' | 'other';
  quantity: number;
  condition: 'good' | 'fair' | 'poor' | 'needs-repair';
  location?: string;
  notes?: string;
  photoUrl?: string;
  expiryDate?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  supplier?: string;
  reorderLink?: string;
  lastUsedFor?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
};

export const chartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
} as const;
