'use client';

import { db, auth } from './firebase/firebase';
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
  deleteField,
} from 'firebase/firestore';
import type { Kid, Gift, Volunteer, RecentActivity, DashboardStats, HouseScore } from './types';
import { type KidFormValues, type GiftFormValues, type PublicKidRegistrationValues, kidImportSchema } from './schemas';
import { errorEmitter } from './firebase/error-emitter';
import { FirestorePermissionError } from './firebase/errors';

const forceTokenRefresh = async () => {
  const user = auth.currentUser;
  if (user) {
    // This is the key change to force a refresh.
    await user.getIdToken(true);
  }
};

/**
 * Creates a kid profile from the public registration form (no auth required).
 * className, houseColor, and coinsBalance are set to defaults — admin assigns later.
 */
export async function addKidPublic(data: PublicKidRegistrationValues): Promise<void> {
  const newKidRef = doc(collection(db, 'kids'));
  const dateString = data.dateOfBirth;
  const newKidData = {
    id: newKidRef.id,
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname || '',
    dateOfBirth: dateString,
    gender: data.gender,
    email: data.email || '',
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    parent2Name: data.parent2Name || '',
    parent2Phone: data.parent2Phone || '',
    allergies: data.allergies || '',
    medicalNotes: data.medicalNotes || '',
    photoUrl: data.photoDataUrl || `https://picsum.photos/seed/${data.firstName}${data.lastName}/400/400`,
    coinsBalance: 0,
    totalAttendance: 0,
    birthdayMonth: parseInt(dateString.split('-')[1], 10),
    createdAt: new Date().toISOString(),
    className: '',
    houseColor: '',
  };
  await setDoc(newKidRef, newKidData);
}

/**
 * Writes a document to /welcomeICs/{uid} so the Cloud Function can set
 * the `welcomeIC: true` custom claim on the user's token.
 */
export async function registerAsWelcomeIC(uid: string): Promise<void> {
  await setDoc(doc(db, 'welcomeICs', uid), {
    uid,
    createdAt: new Date().toISOString(),
  });
}

export const addKid = async (data: KidFormValues) => {
  await forceTokenRefresh();
  const dateString = data.dateOfBirth;
  
  const newKidRef = doc(collection(db, 'kids'));
  const newKidData = {
    id: newKidRef.id,
    firstName: data.firstName,
    lastName: data.lastName,
    nickname: data.nickname || '',
    dateOfBirth: dateString,
    gender: data.gender,
    email: data.email || '',
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    parent2Name: data.parent2Name || '',
    parent2Phone: data.parent2Phone || '',
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

  await setDoc(newKidRef, newKidData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: newKidRef.path,
        operation: 'create',
        requestResourceData: newKidData,
      })
    );
    throw serverError;
  });
};

export const importKids = async (csvData: string) => {
  await forceTokenRefresh();
  const batch = writeBatch(db);
  const lines = csvData.trim().split('\n');
  let successCount = 0;
  let errorCount = 0;
  const errors: { line: number; error: string; data: string }[] = [];

  const headers = [
    'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'email',
    'parentName', 'parentPhone', 'parent2Name', 'parent2Phone',
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
      email: data.email || '',
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parent2Name: data.parent2Name || '',
      parent2Phone: data.parent2Phone || '',
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
  await forceTokenRefresh();
  try {
    const kidsCol = collection(db, 'kids');
    const q = query(kidsCol, orderBy('createdAt', 'desc'));
    const kidsSnapshot = await getDocs(q);
    const kidsList = kidsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Kid));
    return kidsList;
  } catch (error: any) {
    console.error('[Data] Error fetching kids:', error);
    if (error && error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'kids',
            operation: 'list'
        }));
    }
    return [];
  }
};

export const getKidById = async (kidId: string): Promise<Kid | null> => {
  await forceTokenRefresh();
  try {
    const kidRef = doc(db, 'kids', kidId);
    const kidSnap = await getDoc(kidRef);

    if (kidSnap.exists()) {
      return { id: kidSnap.id, ...kidSnap.data() } as Kid;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(`[Data] Error fetching kid by id ${kidId}:`, error);
    if (error && error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `kids/${kidId}`,
            operation: 'get'
        }));
    }
    return null;
  }
};


export const updateKid = async (kidId: string, data: Partial<KidFormValues>) => {
  await forceTokenRefresh();
  const kidRef = doc(db, 'kids', kidId);
  
  const updateData: any = { ...data };

  if (data.dateOfBirth) {
    const dateString = data.dateOfBirth;
    updateData.dateOfBirth = dateString;
    updateData.birthdayMonth = parseInt(dateString.split('-')[1], 10);
  }

  if (data.photoDataUrl) {
    updateData.photoUrl = data.photoDataUrl;
  }
  delete updateData.photoDataUrl;

  if ('className' in data) updateData.className = data.className ?? deleteField();
  if ('houseColor' in data) updateData.houseColor = data.houseColor ?? deleteField();
  if ('barcode' in data) updateData.barcode = data.barcode || deleteField();

  const sanitizedData: Record<string, unknown> = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  );

  await updateDoc(kidRef, sanitizedData as any).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: kidRef.path,
        operation: 'update',
        requestResourceData: sanitizedData,
      })
    );
    throw serverError;
  });
};

export const deleteKid = async (kidId: string) => {
  await forceTokenRefresh();
  const kidRef = doc(db, 'kids', kidId);
  await deleteDoc(kidRef).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: kidRef.path,
        operation: 'delete',
      })
    );
    throw serverError;
  });
};

export const getTodayCheckedInKidIds = async (): Promise<string[]> => {
    await forceTokenRefresh();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('type', '==', 'check-in'), where('timestamp', '>=', startOfToday));

    try {
        const querySnapshot = await getDocs(q);
        const kidIds = new Set<string>();
        querySnapshot.forEach(doc => {
            kidIds.add(doc.data().kidId);
        });
        return Array.from(kidIds);
    } catch (error: any) {
        console.error('Error fetching today\'s check-ins:', error);
        return [];
    }
};

export const checkInKid = async (kidId: string) => {
  await forceTokenRefresh();
  const kidRef = doc(db, 'kids', kidId);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const activitiesCollectionRef = collection(db, 'activities');
  const todaysAttendanceQuery = query(activitiesCollectionRef, where('type', '==', 'check-in'), where('kidId', '==', kidId), where('timestamp', '>=', startOfToday));
  
  const todaysAttendanceSnapshot = await getDocs(todaysAttendanceQuery);

  if (!todaysAttendanceSnapshot.empty) {
    throw new Error("This kid has already been checked in today.");
  }
  
  return runTransaction(db, async (transaction) => {
    const kidSnap = await transaction.get(kidRef);
    if (!kidSnap.exists()) {
      throw new Error('Kid not found');
    }
    const kidData = kidSnap.data();
    
    const attendanceRef = doc(collection(db, 'kids', kidId, 'attendances'));
    const activityRef = doc(collection(db, 'activities'));

    transaction.update(kidRef, {
      coinsBalance: increment(10),
      totalAttendance: increment(1),
    });

    transaction.set(attendanceRef, {
      id: attendanceRef.id,
      kidId: kidId,
      kidName: `${kidData.firstName} ${kidData.lastName}`,
      photoUrl: kidData.photoUrl,
      timestamp: serverTimestamp(),
    });

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
    if (serverError.message !== "This kid has already been checked in today.") {
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
    }
    throw serverError;
  });
};

export const getGifts = async (): Promise<Gift[]> => {
  await forceTokenRefresh();
  try {
    const giftsCol = collection(db, 'gifts');
    const q = query(giftsCol, orderBy('createdAt', 'desc'));
    const giftsSnapshot = await getDocs(q);
    const giftsList = giftsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Gift));
    return giftsList;
  } catch (error: any) {
    console.error('[Data] Error fetching gifts:', error);
    if (error && error.code === 'permission-denied') {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'gifts',
          operation: 'list'
      }));
    }
    return [];
  }
};

export const getGiftById = async (giftId: string): Promise<Gift | null> => {
  await forceTokenRefresh();
  try {
    const giftRef = doc(db, 'gifts', giftId);
    const giftSnap = await getDoc(giftRef);
    if (giftSnap.exists()) {
      return { id: giftSnap.id, ...giftSnap.data() } as Gift;
    }
    return null;
  } catch (error: any) {
    console.error(`[Data] Error fetching gift by id ${giftId}:`, error);
    if (error && error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `gifts/${giftId}`,
            operation: 'get'
        }));
    }
    return null;
  }
};

export const addGift = async (data: GiftFormValues) => {
  await forceTokenRefresh();
  const newGiftRef = doc(collection(db, 'gifts'));
  const newGiftData = {
    ...data,
    id: newGiftRef.id,
    imageUrl: data.photoDataUrl || `https://picsum.photos/seed/${data.name}/600/400`,
    createdAt: new Date().toISOString(),
  };
  delete (newGiftData as any).photoDataUrl;

  await setDoc(newGiftRef, newGiftData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: newGiftRef.path,
        operation: 'create',
        requestResourceData: newGiftData,
      })
    );
    throw serverError;
  });
};

export const updateGift = async (giftId: string, data: Partial<GiftFormValues>) => {
  await forceTokenRefresh();
  const giftRef = doc(db, 'gifts', giftId);
  const updateData: any = { ...data };
  if (data.photoDataUrl) {
    updateData.imageUrl = data.photoDataUrl;
  }
  delete updateData.photoDataUrl;

  await updateDoc(giftRef, updateData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: giftRef.path,
        operation: 'update',
        requestResourceData: updateData,
      })
    );
    throw serverError;
  });
};

export const deleteGift = async (giftId: string) => {
  await forceTokenRefresh();
  const giftRef = doc(db, 'gifts', giftId);
  await deleteDoc(giftRef).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: giftRef.path,
        operation: 'delete',
      })
    );
    throw serverError;
  });
};

export const redeemGift = async (kidId: string, giftId: string) => {
  await forceTokenRefresh();
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

    transaction.update(kidRef, {
      coinsBalance: increment(-giftData.coinCost),
    });
    transaction.update(giftRef, {
      stock: increment(-1),
    });

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
        },
      })
    );
    throw serverError;
  });
};

export const awardCoins = async (kidId: string, amount: number, reason: string) => {
  await forceTokenRefresh();
  const kidRef = doc(db, 'kids', kidId);

  return runTransaction(db, async (transaction) => {
    const kidSnap = await transaction.get(kidRef);
    if (!kidSnap.exists()) throw new Error('Kid not found');
    const kidData = kidSnap.data();

    const txRef = doc(collection(db, 'kids', kidId, 'coinTransactions'));
    const activityRef = doc(collection(db, 'activities'));

    transaction.update(kidRef, { coinsBalance: increment(amount) });

    transaction.set(txRef, {
      id: txRef.id,
      kidId,
      amount,
      reason,
      timestamp: serverTimestamp(),
    });

    transaction.set(activityRef, {
      id: activityRef.id,
      type: 'check-in',
      kidId,
      kidName: `${kidData.firstName} ${kidData.lastName}`,
      photoUrl: kidData.photoUrl,
      details: `Awarded ${amount} coins (${reason})`,
      timestamp: serverTimestamp(),
    });
  }).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: `Transaction on ${kidRef.path}`,
        operation: 'update',
        requestResourceData: { coinsAward: amount },
      })
    );
    throw serverError;
  });
};

export const addVolunteer = async (data: any) => {
  await forceTokenRefresh();
  const newVolunteerRef = doc(collection(db, 'volunteers'));
  const newVolunteerData = {
    ...data,
    id: newVolunteerRef.id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newVolunteerRef, newVolunteerData).catch((serverError) => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: newVolunteerRef.path,
        operation: 'create',
        requestResourceData: newVolunteerData,
      })
    );
    throw serverError;
  });
};

export const getVolunteers = async (): Promise<Volunteer[]> => {
  await forceTokenRefresh();
  try {
    const volunteersCol = collection(db, 'volunteers');
    const q = query(volunteersCol, orderBy('createdAt', 'desc'));
    const volunteersSnapshot = await getDocs(q);
    const volunteersList = volunteersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Volunteer));
    return volunteersList;
  } catch(error: any) {
    console.error('[Data] Error fetching volunteers:', error);
    if (error && error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'volunteers',
            operation: 'list'
        }));
    }
    return [];
  }
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  await forceTokenRefresh();
  try {
    const activitiesCol = collection(db, 'activities');
    const q = query(activitiesCol, orderBy('timestamp', 'desc'), limit(5));
    const activitiesSnapshot = await getDocs(q);

    const activities: any[] = [];
    activitiesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.timestamp) { 
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
  await forceTokenRefresh();
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
  await forceTokenRefresh();
  try {
    const q = query(
      collectionGroup(db, 'activities'),
      where('type', '==', 'check-in'),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    const EIGHT_WEEKS_IN_MS = 8 * 7 * 24 * 60 * 60 * 1000;
    const eightWeeksAgo = new Date(Date.now() - EIGHT_WEEKS_IN_MS);

    const weeklyCounts = Array.from({ length: 8 }, () => 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    querySnapshot.forEach((doc) => {
      const activity = doc.data();
      const activityDate = (activity.timestamp as Timestamp).toDate();

      if (activityDate < eightWeeksAgo) {
        return;
      }

      const diffTime = today.getTime() - activityDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const weekIndex = Math.floor(diffDays / 7);

      if (weekIndex >= 0 && weekIndex < 8) {
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
    }).reverse(); 
    
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
    return Array.from({ length: 8 }, (_, i) => ({
      date: `Week ${8 - i}`,
      attendance: 0,
    }));
  }
};

// ─── House Scores ─────────────────────────────────────────────────────────────

const HOUSE_IDS = ['red', 'blue', 'yellow', 'green'] as const;

export const getHouseScores = async (): Promise<HouseScore[]> => {
  await forceTokenRefresh();
  const results: HouseScore[] = [];
  for (const id of HOUSE_IDS) {
    try {
      const ref = doc(db, 'houseScores', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        results.push(snap.data() as HouseScore);
      } else {
        results.push({ id, color: id, points: 0, updatedAt: new Date().toISOString() });
      }
    } catch {
      results.push({ id, color: id, points: 0, updatedAt: new Date().toISOString() });
    }
  }
  return results;
};

export const addHousePoints = async (houseId: string, points: number): Promise<void> => {
  const ref = doc(db, 'houseScores', houseId);
  // setDoc with merge uses a single atomic write — no read needed
  await setDoc(ref, {
    id: houseId,
    color: houseId,
    points: increment(points),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const resetHousePoints = async (houseId: string): Promise<void> => {
  const ref = doc(db, 'houseScores', houseId);
  await setDoc(ref, {
    id: houseId,
    color: houseId,
    points: 0,
    updatedAt: new Date().toISOString(),
  });
};
