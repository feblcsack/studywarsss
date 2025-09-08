'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// 1. Definisikan bentuk (interface) dari settings
export interface Settings {
  dailyGoal: number;
  pomodoroLength: number;
  shortBreak: number;
  longBreak: number;
  notifications: boolean;
  sounds: boolean;
  darkMode: boolean; // Meskipun belum diimplementasikan, kita simpan
  autoBreaks: boolean;
  weeklyGoal: number;
  longBreakInterval: number; // Interval untuk istirahat panjang (setelah berapa siklus)
}

// 2. Nilai default untuk settings
const defaultSettings: Settings = {
  dailyGoal: 120,
  pomodoroLength: 25,
  shortBreak: 5,
  longBreak: 15,
  notifications: true,
  sounds: true,
  darkMode: true,
  autoBreaks: false,
  weeklyGoal: 840,
  longBreakInterval: 4,
};

// 3. Definisikan tipe untuk Context
interface SettingsContextType {
  settings: Settings;
  saveSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

// 4. Buat Context dengan nilai default
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// 5. Buat Provider Component
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings dari localStorage saat komponen pertama kali dirender
  useEffect(() => {
    const savedSettings = localStorage.getItem('studySettings');
    if (savedSettings) {
      // Gabungkan settings yang tersimpan dengan default, untuk jaga-jaga ada key baru
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Fungsi untuk menyimpan settings
  const saveSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      localStorage.setItem('studySettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  // Fungsi untuk reset settings
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('studySettings', JSON.stringify(defaultSettings));
  }

  const value = { settings, saveSettings, resetSettings };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// 6. Buat custom hook untuk mempermudah penggunaan context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}