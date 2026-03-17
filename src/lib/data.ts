'use client';

import { db } from './firebase/firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, getDoc, updateDoc, deleteDoc, serverTimestamp, increment, runTransaction, collectionGroup, limit, where } from 'firebase/firestore';
import type { Kid, Gift, Volunteer, RecentActivity, DashboardStats } from './types';
import { UserCheck, Gift as GiftIcon } from 'lucide-react';
import { type KidFormValues, type GiftFormValues } from './schemas';


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
    dateOfBirth: birthDate,
    gender: data.gender,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    allergies: data.allergies || '',
    medicalNotes: data.medicalNotes || '',
    photoUrl: data.photoDataUrl || `https://picsum.photos/seed/${data.firstName}${data.lastName}/400/400`,
    coinsBalance: 0,
    totalAttendance: 0,
    birthdayMonth: new Date(birthDate).getUTCMonth() + 1,
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
    updateData.dateOfBirth = data.dateOfBirth;
    updateData.birthdayMonth = new Date(data.dateOfBirth).getUTCMonth() + 1;
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
  const kidSnap = await getDoc(kidRef);
  if (!kidSnap.exists()) {
    throw new Error("Kid not found");
  }
  const kidData = kidSnap.data();
  const attendanceRef = doc(collection(db, 'kids', kidId, 'attendances'));

  try {
    await runTransaction(db, async (transaction) => {
      transaction.update(kidRef, {
        coinsBalance: increment(10),
        totalAttendance: increment(1)
      });
      transaction.set(attendanceRef, {
        id: attendanceRef.id,
        kidId: kidId,
        kidName: `${kidData.firstName} ${kidData.lastName}`,
        photoUrl: kidData.photoUrl,
        timestamp: serverTimestamp(),
      });
    });
  } catch (e) {
    console.error(`data.ts (checkInKid): Error checking in kid with ID ${kidId}: `, e);
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

      transaction.update(kidRef, {
        coinsBalance: increment(-giftData.coinCost)
      });
      transaction.update(giftRef, {
        stock: increment(-1)
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
    });

  } catch (e) {
    console.error("data.ts (redeemGift): Transaction failed: ", e);
    throw e;
  }
};


export const addVolunteer = async (data: any) => {
    const newVolunteerRef = doc(collection(db, 'volunteers'));
    const newVolunteerData = {
        ...data,
        id: newVolunteerRef.id,
        createdAt: new Date().toISOString(),
    };
    try {
        await setDoc(newVolunteerRef, newVolunteerData);
    } catch(e) {
        console.error("data.ts (addVolunteer): Error adding document: ", e);
        throw e;
    }
}

export const getVolunteers = async (): Promise<Volunteer[]> => {
    const volunteersCol = collection(db, 'volunteers');
    const q = query(volunteersCol, orderBy('createdAt', 'desc'));
    const volunteersSnapshot = await getDocs(q);
    const volunteersList = volunteersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Volunteer));
    return volunteersList;
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
    try {
        const attendanceQuery = query(collectionGroup(db, 'attendances'), orderBy('timestamp', 'desc'), limit(5));
        const redemptionQuery = query(collectionGroup(db, 'redemptions'), orderBy('timestamp', 'desc'), limit(5));

        const [attendanceSnapshot, redemptionSnapshot] = await Promise.all([
            getDocs(attendanceQuery),
            getDocs(redemptionQuery),
        ]);

        const activities: any[] = [];

        attendanceSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) {
                activities.push({
                    id: doc.id,
                    type: 'check-in',
                    kidName: data.kidName,
                    details: `Checked in`,
                    timestamp: data.timestamp,
                    icon: UserCheck,
                    photoUrl: data.photoUrl
                });
            }
        });

        redemptionSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.timestamp) {
                activities.push({
                    id: doc.id,
                    type: 'redemption',
                    kidName: data.kidName,
                    details: `Redeemed ${data.giftName}`,
                    timestamp: data.timestamp,
                    icon: GiftIcon,
                    photoUrl: data.photoUrl
                });
            }
        });

        activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        
        const formattedActivities = activities.slice(0, 5).map(activity => {
            const date = activity.timestamp.toDate();
            const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) { return { ...activity, timestamp: `${Math.floor(interval)} years ago`}; }
            interval = seconds / 2592000;
            if (interval > 1) { return { ...activity, timestamp: `${Math.floor(interval)} months ago`}; }
            interval = seconds / 86400;
            if (interval > 1) { return { ...activity, timestamp: `${Math.floor(interval)} days ago`}; }
            interval = seconds / 3600;
            if (interval > 1) { return { ...activity, timestamp: `${Math.floor(interval)} hours ago`}; }
            interval = seconds / 60;
            if (interval > 1) { return { ...activity, timestamp: `${Math.floor(interval)} mins ago`}; }
            return { ...activity, timestamp: `${Math.floor(seconds)} secs ago`};
        });

        return formattedActivities as RecentActivity[];

    } catch (error) {
        console.error("Error fetching recent activities:", error);
        return [];
    }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const kidsSnapshot = await getDocs(collection(db, "kids"));
        const volunteersSnapshot = await getDocs(collection(db, "volunteers"));
        
        const today = new Date();
        let todaysBirthdays = 0;
        kidsSnapshot.docs.forEach(doc => {
            const kid = doc.data();
            const birthDate = new Date(kid.dateOfBirth);
            if ((birthDate.getUTCMonth() + 1) === (today.getUTCMonth() + 1) && birthDate.getUTCDate() === today.getUTCDate()) {
                todaysBirthdays++;
            }
        });

        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        
        const attendanceQuery = query(
            collectionGroup(db, 'attendances'), 
            where('timestamp', '>=', startOfToday)
        );
        const todayAttendanceSnapshot = await getDocs(attendanceQuery);
        const kidsCheckedIn = todayAttendanceSnapshot.size;

        const redemptionQuery = query(
            collectionGroup(db, 'redemptions'), 
            where('timestamp', '>=', startOfToday)
        );
        const todayRedemptionsSnapshot = await getDocs(redemptionQuery);
        const giftsRedeemed = todayRedemptionsSnapshot.size;

        return {
            kidsCheckedIn: kidsCheckedIn,
            volunteersOnDuty: volunteersSnapshot.size,
            todaysBirthdays: todaysBirthdays,
            giftsRedeemed: giftsRedeemed,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            kidsCheckedIn: 0,
            volunteersOnDuty: 0,
            todaysBirthdays: 0,
            giftsRedeemed: 0,
        };
    }
};
