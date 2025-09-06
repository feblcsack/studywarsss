// types/index.ts
export interface StudySession {
    id: string;
    userId: string;
    date: string;
    duration: number; // in minutes
    createdAt: Date;
  }
  
  export interface DayData {
    date: string;
    totalMinutes: number;
    level: number; // 0-5 for intensity
  }
  
  export interface UserStats {
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
  }