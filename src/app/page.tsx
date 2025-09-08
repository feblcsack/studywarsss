'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyData } from '@/hooks/useStudyData';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, Settings, Clock } from 'lucide-react';
import AuthDialog from '@/components/AuthDialog';
import StudyHeatmap from '@/components/StudyHeatmap';
import StatsCards from '@/components/StatsCards';
import SettingsDialog from '@/components/SettingsDialog';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, logout } = useAuth();
  const { addSession, getAllSessions } = useStudyData();
  const { settings } = useSettings();

  const sessions = getAllSessions();
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(0);

  // --- Pomodoro states (pakai settings) ---
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'break'>('focus');
  const [pomodoroDuration, setPomodoroDuration] = useState(settings.pomodoroLength * 60);
  const [goalMinutes, setGoalMinutes] = useState(settings.dailyGoal);

  // Sync state ketika settings berubah
  useEffect(() => {
    setGoalMinutes(settings.dailyGoal);
    if (pomodoroMode === 'focus') {
      setPomodoroDuration(settings.pomodoroLength * 60);
    } else {
      setPomodoroDuration(settings.shortBreak * 60);
    }
  }, [settings, pomodoroMode]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          const minutes = Math.floor(newTime / 60);
          setCurrentSessionMinutes(minutes);

          if (isPomodoro && newTime >= pomodoroDuration) {
            clearInterval(interval);
            setIsRunning(false);

            if (pomodoroMode === 'focus') {
              if (user) addSession(Math.floor(pomodoroDuration / 60));
              setPomodoroMode('break');
              setPomodoroDuration(settings.shortBreak * 60);
              setTime(0);

              if (!settings.autoBreaks) {
                alert("Focus done ✅ Time for a short break ☕");
              } else {
                setIsRunning(true);
              }
            } else {
              setPomodoroMode('focus');
              setPomodoroDuration(settings.pomodoroLength * 60);
              setTime(0);

              if (!settings.autoBreaks) {
                alert("Break done 🎉 Back to focus 💪");
              } else {
                setIsRunning(true);
              }
            }
          }

          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPomodoro, pomodoroMode, pomodoroDuration, user, addSession, settings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleStop = async () => {
    setIsRunning(false);

    if (time > 0 && user && !isPomodoro) {
      const minutes = Math.floor(time / 60);
      await addSession(minutes);
    }

    setTime(0);
    setCurrentSessionMinutes(0);
    if (isPomodoro) {
      setPomodoroMode('focus');
      setPomodoroDuration(settings.pomodoroLength * 60);
    }
  };

  const handlePomodoroToggle = () => {
    setIsPomodoro(!isPomodoro);
    setPomodoroMode('focus');
    setPomodoroDuration(settings.pomodoroLength * 60);
    setTime(0);
    setIsRunning(false);
  };

  // Grid Background Component
  const GridBackground = () => (
    <>
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    </>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <GridBackground />
        <Card className="w-96 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm relative z-50">
          <CardHeader>
            <CardTitle className="text-center text-white">Study Tracker</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-300 mb-6">Track your learning journey with beautiful visualizations</p>
            <Button
              onClick={() => setShowAuthDialog(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0"><GridBackground /></div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <span className="text-slate-300">Welcome, {user.email}</span>
          <Button variant="ghost" size="icon" onClick={() => setShowSettingsDialog(true)} className="hover:bg-slate-700/50">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={logout} className="border-slate-600 hover:bg-slate-700/50">
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-40">
        {/* Timer Section */}
          <div className="mb-10">
          <CardContent className="text-center">
            <div className="text-6xl font-light mb-4 font-mono tracking-wider text-white drop-shadow-lg">
              {formatTime(isPomodoro ? pomodoroDuration - time : time)}
            </div>

            {isPomodoro && (
              <div className="text-sm text-blue-400 mb-4">
                Mode: {pomodoroMode === 'focus' ? "Focus 🔥" : "Break ☕"}
              </div>
            )}

            <div className="flex justify-center gap-4 mb-6">
              <Button onClick={handleStart} disabled={isRunning} size="lg" className="w-16 h-16 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 shadow-lg ">
                <Play className="h-6 w-6" />
              </Button>
              <Button onClick={handlePause} disabled={!isRunning} size="lg" className="w-16 h-16 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 shadow-lg ">
                <Pause className="h-6 w-6" />
              </Button>
              <Button onClick={handleStop} disabled={time === 0} size="lg" className="w-16 h-16 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 shadow-lg ">
                <Square className="h-6 w-6" />
              </Button>
              <Button onClick={handlePomodoroToggle} size="lg" className="rounded-full bg-slate-800 hover:bg-slate-700 shadow-lg">
                <Clock className="h-6 w-6" />
              </Button>
            </div>

            {isRunning && currentSessionMinutes > 0 && !isPomodoro && (
              <div className="text-sm text-emerald-400 mb-4 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-lg px-4 py-2 inline-block">
                Current session: {currentSessionMinutes} minutes
              </div>
            )}
          </CardContent>
          </div>

        {/* Progress toward Goal */}
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-md p-3 mb-12 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-white">Daily Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 transition-all duration-500"
                style={{ width: `${Math.min((totalMinutes / goalMinutes) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-2 text-center">
              {totalMinutes}/{goalMinutes} minutes
            </p>
          </CardContent>
        </Card>

        {/* Stats + Heatmap */}
        <div className="mb-8"><StatsCards /></div>
        <StudyHeatmap currentSessionMinutes={currentSessionMinutes} />

        {/* Settings Dialog */}
        <SettingsDialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />
      </div>
    </div>
  );
}
