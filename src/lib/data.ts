'use client';

import { db } from './firebase/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  runTransaction,
  collectionGroup,
  limit,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { format } from 'date-fns';
import type { Kid, Gift, Volunteer, RecentActivity, DashboardStats } from './types';
import { UserCheck, Gift as GiftIcon } from 'lucide-react';
import { type KidFormValues, type GiftFormValues, kidImportSchema } from './schemas';
import { errorEmitter } from './firebase/error-emitter';
import { FirestorePermissionError } from './firebase/errors';
import { z } from 'zod';

export const addKid = async (data: KidFormValues) => {
  const birthDate = data.dateOfBirth; // This is a Date object
  const dateString = format(birthDate, 'yyyy-MM-dd'); // Use date-fns to avoid timezone issues
  
  const newKidRef = doc(collection(db, 'kids'));
  const newKidData = {
    id: newKidRef.id,
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname || '',
    dateOfBirth: dateString,
    gender: data.gender,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    allergies: data.allergies || '',
    medicalNotes: data.medicalNotes || '',
    photoUrl: data.photoDataUrl || `https://picsum.photos/seed/${data.firstName}${data.lastName}/400/400`,
    coinsBalance: 0,
    totalAttendance: 0,
    birthdayMonth: parseInt(dateString.split('-')[1], 10),
    createdAt: new Date().toISOString(),
    className: data.className,
    houseColor: data.houseColor || '',
  };

  setDoc(newKidRef, newKidData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: newKidRef.path,
        operation: 'create',
        requestResourceData: newKidData,
      })
    );
  });
};

export const importKids = async (csvData: string) => {
  const batch = writeBatch(db);
  const lines = csvData.trim().split('\n');
  let successCount = 0;
  let errorCount = 0;
  const errors: { line: number; error: string; data: string }[] = [];

  const headers = [
    'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'parentName', 'parentPhone', 
    'className', 'houseColor', 'nickname', 'allergies', 'medicalNotes', 'photoUrl', 
    'coinsBalance', 'totalAttendance'
  ];

  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;

    const values = line.split(',').map(v => v.trim());
    const rowData: { [key: string]: string } = {};
    headers.forEach((header, i) => {
      rowData[header] = values[i] || '';
    });
    
    const parseResult = kidImportSchema.safeParse(rowData);

    if (!parseResult.success) {
      errorCount++;
      const errorMessages = parseResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      errors.push({ line: index + 1, error: errorMessages, data: line });
      continue;
    }

    const data = parseResult.data;
    const docRef = data.id ? doc(db, 'kids', data.id) : doc(collection(db, 'kids'));
    
    const newKidData = {
      id: docRef.id,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      className: data.className,
      houseColor: data.houseColor || '',
      nickname: data.nickname || '',
      allergies: data.allergies || '',
      medicalNotes: data.medicalNotes || '',
      photoUrl: data.photoUrl || `https://picsum.photos/seed/${data.firstName}${data.lastName}/400/400`,
      coinsBalance: data.coinsBalance,
      totalAttendance: data.totalAttendance,
      birthdayMonth: parseInt(data.dateOfBirth.split('-')[1], 10),
      createdAt: new Date().toISOString(),
    };

    batch.set(docRef, newKidData);
    successCount++;
  }

  if (successCount > 0) {
    await batch.commit().catch((serverError) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'kids collection',
            operation: 'create (batch)',
            requestResourceData: { note: `Batch write for ${successCount} kids.` }
          })
        );
        throw serverError;
    });
  }

  return { successCount, errorCount, errors };
};

export const getKids = async (): Promise<Kid[]> => {
  const kidsCol = collection(db, 'kids');
  const q = query(kidsCol, orderBy('createdAt', 'desc'));
  const kidsSnapshot = await getDocs(q);
  const kidsList = kidsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Kid));
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
    const dateString = format(data.dateOfBirth, 'yyyy-MM-dd');
    updateData.dateOfBirth = dateString;
    updateData.birthdayMonth = parseInt(dateString.split('-')[1], 10);
  }

  if (data.photoDataUrl) {
    updateData.photoUrl = data.photoDataUrl;
  }
  delete updateData.photoDataUrl;

  updateDoc(kidRef, updateData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: kidRef.path,
        operation: 'update',
        requestResourceData: updateData,
      })
    );
  });
};

export const deleteKid = async (kidId: string) => {
  const kidRef = doc(db, 'kids', kidId);
  deleteDoc(kidRef).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: kidRef.path,
        operation: 'delete',
      })
    );
  });
};

export const checkInKid = async (kidId: string) => {
  const kidRef = doc(db, 'kids', kidId);
  
  return runTransaction(db, async (transaction) => {
    const kidSnap = await transaction.get(kidRef);
    if (!kidSnap.exists()) {
      throw new Error('Kid not found');
    }
    const kidData = kidSnap.data();
    
    // Define refs for all documents to be written
    const attendanceRef = doc(collection(db, 'kids', kidId, 'attendances'));
    const activityRef = doc(collection(db, 'activities'));

    // Kid update
    transaction.update(kidRef, {
      coinsBalance: increment(10),
      totalAttendance: increment(1),
    });

    // Attendance sub-collection record (for per-kid history)
    transaction.set(attendanceRef, {
      id: attendanceRef.id,
      kidId: kidId,
      kidName: `${kidData.firstName} ${kidData.lastName}`,
      photoUrl: kidData.photoUrl,
      timestamp: serverTimestamp(),
    });

    // Top-level activity record for fast queries
    transaction.set(activityRef, {
        id: activityRef.id,
        type: 'check-in',
        kidId: kidId,
        kidName: `${kidData.firstName} ${kidData.lastName}`,
        photoUrl: kidData.photoUrl,
        details: 'Checked in',
        timestamp: serverTimestamp()
    });

  }).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `Transaction on ${kidRef.path}`,
        operation: 'update',
        requestResourceData: {
          kidUpdate: { coinsBalance: 'increment(10)', totalAttendance: 'increment(1)' },
          activityCreate: { type: 'check-in' },
        },
      })
    );
    throw serverError;
  });
};

export const getGifts = async (): Promise<Gift[]> => {
  const giftsCol = collection(db, 'gifts');
  const q = query(giftsCol, orderBy('createdAt', 'desc'));
  const giftsSnapshot = await getDocs(q);
  const giftsList = giftsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Gift));
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

  setDoc(newGiftRef, newGiftData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: newGiftRef.path,
        operation: 'create',
        requestResourceData: newGiftData,
      })
    );
  });
};

export const updateGift = async (giftId: string, data: Partial<GiftFormValues>) => {
  const giftRef = doc(db, 'gifts', giftId);
  const updateData: any = { ...data };
  if (data.photoDataUrl) {
    updateData.imageUrl = data.photoDataUrl;
  }
  delete updateData.photoDataUrl;

  updateDoc(giftRef, updateData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: giftRef.path,
        operation: 'update',
        requestResourceData: updateData,
      })
    );
  });
};

export const deleteGift = async (giftId: string) => {
  const giftRef = doc(db, 'gifts', giftId);
  deleteDoc(giftRef).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: giftRef.path,
        operation: 'delete',
      })
    );
  });
};

export const redeemGift = async (kidId: string, giftId: string) => {
  const kidRef = doc(db, 'kids', kidId);
  const giftRef = doc(db, 'gifts', giftId);

  return runTransaction(db, async (transaction) => {
    const kidDoc = await transaction.get(kidRef);
    const giftDoc = await transaction.get(giftRef);

    if (!kidDoc.exists() || !giftDoc.exists()) {
      throw new Error('Kid or Gift not found!');
    }

    const kidData = kidDoc.data();
    const giftData = giftDoc.data();

    if (kidData.coinsBalance < giftData.coinCost) {
      throw new Error('Not enough coins!');
    }

    if (giftData.stock <= 0) {
      throw new Error('Gift is out of stock!');
    }

    const redemptionRef = doc(collection(db, 'kids', kidId, 'redemptions'));
    const activityRef = doc(collection(db, 'activities'));

    // Perform the updates
    transaction.update(kidRef, {
      coinsBalance: increment(-giftData.coinCost),
    });
    transaction.update(giftRef, {
      stock: increment(-1),
    });

    // Create a redemption record in subcollection
    transaction.set(redemptionRef, {
      id: redemptionRef.id,
      kidId: kidId,
      kidName: `${kidData.firstName} ${kidData.lastName}`,
      photoUrl: kidData.photoUrl,
      giftId: giftId,
      giftName: giftData.name,
      coinCost: giftData.coinCost,
      timestamp: serverTimestamp(),
    });

    // Create a top-level activity record
    transaction.set(activityRef, {
      id: activityRef.id,
      type: 'redemption',
      kidId: kidId,
      kidName: `${kidData.firstName} ${kidData.lastName}`,
      photoUrl: kidData.photoUrl,
      details: `Redeemed ${giftData.name}`,
      timestamp: serverTimestamp(),
    });
  }).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `Transaction on ${kidRef.path} and ${giftRef.path}`,
        operation: 'update',
        requestResourceData: {
          /* data for debugging */
        },
      })
    );
    throw serverError;
  });
};

export const addVolunteer = async (data: any) => {
  const newVolunteerRef = doc(collection(db, 'volunteers'));
  const newVolunteerData = {
    ...data,
    id: newVolunteerRef.id,
    createdAt: new Date().toISOString(),
  };
  setDoc(newVolunteerRef, newVolunteerData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: newVolunteerRef.path,
        operation: 'create',
        requestResourceData: newVolunteerData,
      })
    );
  });
};

export const getVolunteers = async (): Promise<Volunteer[]> => {
  const volunteersCol = collection(db, 'volunteers');
  const q = query(volunteersCol, orderBy('createdAt', 'desc'));
  const volunteersSnapshot = await getDocs(q);
  const volunteersList = volunteersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Volunteer));
  return volunteersList;
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  try {
    const activitiesCol = collection(db, 'activities');
    const q = query(activitiesCol, orderBy('timestamp', 'desc'), limit(5));
    const activitiesSnapshot = await getDocs(q);

    const activities: any[] = [];
    activitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.timestamp) { // ensure timestamp exists before processing
        activities.push({
          id: doc.id,
          ...data,
        });
      }
    });

    const formattedActivities = activities.map((activity) => {
      const date = activity.timestamp.toDate();
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) {
        return { ...activity, timestamp: `${Math.floor(interval)} years ago` };
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return { ...activity, timestamp: `${Math.floor(interval)} months ago` };
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return { ...activity, timestamp: `${Math.floor(interval)} days ago` };
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return { ...activity, timestamp: `${Math.floor(interval)} hours ago` };
      }
      interval = seconds / 60;
      if (interval > 1) {
        return { ...activity, timestamp: `${Math.floor(interval)} mins ago` };
      }
      return { ...activity, timestamp: `${Math.floor(seconds)} secs ago` };
    });

    return formattedActivities as RecentActivity[];
  } catch (error: any) {
    console.error('Error fetching recent activities:', error);
    if (error && error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'activities',
            operation: 'list'
        }));
    }
    return [];
  }
};


export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const kidsSnapshot = await getDocs(collection(db, 'kids'));
    const giftsSnapshot = await getDocs(collection(db, 'gifts'));

    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    const birthdayQuery = query(collection(db, 'kids'), where('birthdayMonth', '==', currentMonth));
    const monthlyBirthdaySnapshot = await getDocs(birthdayQuery);
    const thisMonthsBirthdays = monthlyBirthdaySnapshot.size;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const attendanceQuery = query(
      collection(db, 'activities'), 
      where('type', '==', 'check-in'),
      where('timestamp', '>=', startOfToday)
    );
    const todayAttendanceSnapshot = await getDocs(attendanceQuery);
    const kidsCheckedIn = todayAttendanceSnapshot.size;

    let totalGiftStock = 0;
    giftsSnapshot.forEach((doc) => {
      const gift = doc.data();
      if (gift.active) {
        totalGiftStock += gift.stock || 0;
      }
    });

    const totalKids = kidsSnapshot.size;
    
    const stats: DashboardStats = {
      totalKids,
      kidsCheckedIn,
      thisMonthsBirthdays,
      totalGiftStock,
    };
    return stats;
  } catch (error: any) {
    console.error('[Stats] Error fetching dashboard stats:', error);
    if (error && error.code === 'permission-denied') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'kids, gifts, or activities collection',
          operation: 'list',
        })
      );
    }
    // Return empty stats on error to prevent crashes
    const emptyStats: DashboardStats = {
      totalKids: 0,
      kidsCheckedIn: 0,
      thisMonthsBirthdays: 0,
      totalGiftStock: 0,
    };
    return emptyStats;
  }
};

export const getAttendanceTrend = async (): Promise<{ date: string; attendance: number }[]> => {
  try {
    const EIGHT_WEEKS_IN_MS = 8 * 7 * 24 * 60 * 60 * 1000;
    const eightWeeksAgo = new Date(Date.now() - EIGHT_WEEKS_IN_MS);

    const q = query(
      collection(db, 'activities'),
      where('type', '==', 'check-in'),
      where('timestamp', '>=', eightWeeksAgo)
    );

    const querySnapshot = await getDocs(q);

    // Initialize an array of 8 weeks, each with 0 attendance
    const weeklyCounts = Array.from({ length: 8 }, () => 0);
    const today = new Date();

    querySnapshot.forEach((doc) => {
      const activity = doc.data();
      const activityDate = (activity.timestamp as Timestamp).toDate();

      const diffTime = today.getTime() - activityDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // weekIndex 0 is this week (days 0-6), 1 is last week (days 7-13), etc.
      const weekIndex = Math.floor(diffDays / 7);

      if (weekIndex < 8) {
        weeklyCounts[weekIndex]++;
      }
    });

    const trend = weeklyCounts.map((count, i) => {
      let weekLabel = `${i} wks ago`;
      if (i === 0) weekLabel = 'This Week';
      if (i === 1) weekLabel = 'Last Week';
      return {
        date: weekLabel,
        attendance: count,
      };
    }).reverse(); // Reverse so that "This Week" is at the end (right side of chart)
    
    return trend;

  } catch (error: any) {
    console.error("[Data] Error fetching attendance trend:", error);
    if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'activities collection (for attendance trend)',
        operation: 'list',
        requestResourceData: 'This query may require a composite index. Check the console for a link to create it.'
      }));
    }
    // Return a default structure on error to prevent chart from breaking
    return Array.from({ length: 8 }, (_, i) => ({
      date: `Week ${8-i}`,
      attendance: 0,
    }));
  }
};