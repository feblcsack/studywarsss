'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { StudySession, DayData, UserStats } from '@/types';
import { format, startOfYear, endOfYear, addDays, differenceInDays } from 'date-fns';

export function useStudyData() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as StudySession[];
      
      setSessions(sessionsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addSession = async (duration: number) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        date: format(new Date(), 'yyyy-MM-dd'),
        duration,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const getAllSessions = (): StudySession[] => sessions;

  // Helper: semua hari dalam setahun
  const getAllDaysInYear = (year: number): Date[] => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 11, 31));
    const daysDiff = differenceInDays(yearEnd, yearStart);
    
    return Array.from({ length: daysDiff + 1 }, (_, i) =>
      addDays(yearStart, i)
    );
  };

  const getHeatmapData = (): DayData[] => {
    const currentYear = new Date().getFullYear();
    const allDays = getAllDaysInYear(currentYear);
    
    const sessionsByDate = sessions.reduce((acc, session) => {
      acc[session.date] = (acc[session.date] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);

    return allDays.map((date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const totalMinutes = sessionsByDate[dateStr] || 0;
      
      let level = 0;
      if (totalMinutes > 0) {
        level = 1;
        if (totalMinutes >= 30) level = 2;
        if (totalMinutes >= 60) level = 3;
        if (totalMinutes >= 120) level = 4;
        if (totalMinutes >= 180) level = 5;
      }

      return { date: dateStr, totalMinutes, level };
    });
  };

  const calculateCurrentStreak = (): number => {
    const sessionDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      if (sessionDates.includes(dateStr)) {
        streak++;
      } else {
        if (i > 0) break;
      }
      
      currentDate = addDays(currentDate, -1);
    }
    return streak;
  };

  const calculateLongestStreak = (): number => {
    const sessionDates = [...new Set(sessions.map(s => s.date))].sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;
    
    for (const dateStr of sessionDates) {
      const currentDate = new Date(dateStr);
      
      if (previousDate) {
        const daysDiff = differenceInDays(currentDate, previousDate);
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      previousDate = currentDate;
    }
    return Math.max(longestStreak, currentStreak);
  };

  const getUserStats = (): UserStats => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const currentStreak = calculateCurrentStreak();
    const longestStreak = calculateLongestStreak();

    return { totalSessions, totalMinutes, currentStreak, longestStreak };
  };

  const getTotalMinutes = () => sessions.reduce((acc, s) => acc + s.duration, 0);

  return { 
    sessions, 
    loading, 
    addSession, 
    getAllSessions, 
    getHeatmapData, 
    getUserStats, 
    getTotalMinutes 
  };
}
