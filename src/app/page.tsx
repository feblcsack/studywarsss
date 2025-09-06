'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyData } from '@/hooks/useStudyData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, Settings } from 'lucide-react';
import AuthDialog from '@/components/AuthDialog';
import StudyHeatmap from '@/components/StudyHeatmap';
import StatsCards from '@/components/StatsCards';
import SettingsDialog from "@/components/SettingsDialog";
import { Spotlight } from '@/components/ui/spotlight-new';

export default function Home() {
  const { user, logout } = useAuth();
  const { addSession } = useStudyData();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          const minutes = Math.floor(newTime / 60);
          setCurrentSessionMinutes(minutes);
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = async () => {
    setIsRunning(false);
    
    if (time > 0 && user) {
      const minutes = Math.floor(time / 60);
      await addSession(minutes);
    }
    
    setTime(0);
    setCurrentSessionMinutes(0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Spotlight Background */}
        <Spotlight 
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(272, 100%, 85%, .08) 0, hsla(272, 100%, 55%, .02) 50%, hsla(272, 100%, 45%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(272, 100%, 85%, .06) 0, hsla(272, 100%, 55%, .02) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(272, 100%, 85%, .04) 0, hsla(272, 100%, 45%, .02) 80%, transparent 100%)"
          duration={8}
          xOffset={120}
        />
        
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
        
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Spotlight Background */}
      <Spotlight 
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(160, 100%, 85%, .08) 0, hsla(160, 100%, 55%, .02) 50%, hsla(160, 100%, 45%, 0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(160, 100%, 85%, .06) 0, hsla(160, 100%, 55%, .02) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(160, 100%, 85%, .04) 0, hsla(160, 100%, 45%, .02) 80%, transparent 100%)"
        duration={10}
        xOffset={80}
      />

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <span className="text-slate-300">Welcome, {user.email}</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettingsDialog(true)}
            className="hover:bg-slate-700/50"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={logout}
            className="border-slate-600 hover:bg-slate-700/50"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-40">
        {/* Stopwatch Section */}
        <div className="text-center mb-12">
          <div className="text-6xl font-light mb-8 font-mono tracking-wider text-white drop-shadow-lg">
            {formatTime(time)}
          </div>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={handleStart}
              disabled={isRunning}
              size="lg"
              className="w-16 h-16 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 shadow-lg "
            >
              <Play className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={handlePause}
              disabled={!isRunning}
              size="lg"
              className="w-16 h-16 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 shadow-lg "
            >
              <Pause className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={handleStop}
              disabled={time === 0}
              size="lg"
              className="w-16 h-16 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-50 shadow-lg "
            >
              <Square className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Show current session info */}
          {isRunning && currentSessionMinutes > 0 && (
            <div className="text-sm text-emerald-400 mb-4 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-lg px-4 py-2 inline-block">
              Current session: {currentSessionMinutes} minutes
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards />
        </div>

        {/* Heatmap - Pass current session data */}
        <StudyHeatmap currentSessionMinutes={currentSessionMinutes} />

        {/* Settings Dialog */}
        <SettingsDialog 
          open={showSettingsDialog} 
          onOpenChange={setShowSettingsDialog} 
        />
      </div>
    </div>
  );
}