'use client';
import { useStudyData } from '@/hooks/useStudyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Flame, Trophy } from 'lucide-react';

export default function StatsCards() {
  const { getUserStats } = useStudyData();
  const stats = getUserStats();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
   
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const statCards = [
    {
      title: 'Total Time',
      value: formatTime(stats.totalMinutes),
      icon: Clock,
      gradient: 'from-slate-600/20 to-slate-500/20',
      iconBg: 'from-slate-500/30 to-slate-600/30',
      glowColor: 'slate-500/10',
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions.toString(),
      icon: Calendar,
      gradient: 'from-emerald-600/20 to-teal-500/20',
      iconBg: 'from-emerald-500/30 to-teal-500/30',
      glowColor: 'emerald-500/10',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Flame,
      gradient: 'from-orange-600/20 to-red-500/20',
      iconBg: 'from-orange-500/30 to-red-500/30',
      glowColor: 'orange-500/10',
    },
    {
      title: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      icon: Trophy,
      gradient: 'from-yellow-600/20 to-amber-500/20',
      iconBg: 'from-yellow-500/30 to-amber-500/30',
      glowColor: 'yellow-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statCards.map((card, index) => {
        const Icon = card.icon;
       
        return (
          <Card 
            key={index} 
            className={`bg-slate-800/40 border-slate-700/50 backdrop-blur-md hover:bg-slate-800/60 transition-all duration-500 group hover:shadow-lg hover:shadow-${card.glowColor} hover:-translate-y-1`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                {card.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.iconBg} backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-all duration-300`}>
                <Icon className="h-4 w-4 text-white drop-shadow-sm" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-3xl font-bold text-white mb-2 group-hover:text-slate-50 transition-colors duration-300">
                {card.value}
              </div>
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${card.gradient} mb-3 opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                {index === 0 && 'Time invested in growth ⏰'}
                {index === 1 && 'Sessions completed 📚'}
                {index === 2 && 'Days of consistency 🔥'}
                {index === 3 && 'Personal best record 🏆'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}