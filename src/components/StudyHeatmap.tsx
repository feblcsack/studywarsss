'use client';
import { useStudyData } from '@/hooks/useStudyData';
import { format, getDay } from 'date-fns';

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface StudyHeatmapProps {
  currentSessionMinutes?: number;
}

export default function StudyHeatmap({ currentSessionMinutes = 0 }: StudyHeatmapProps) {
  const { getHeatmapData, getUserStats } = useStudyData();
  const heatmapData = getHeatmapData();
  const stats = getUserStats();

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-slate-700/30', // level 0 - no activity
      'bg-emerald-900/60', // level 1 - light activity
      'bg-emerald-700/75', // level 2 - medium activity  
      'bg-emerald-500/85', // level 3 - high activity
      'bg-emerald-400/95', // level 4 - very high activity
      'bg-emerald-300', // level 5 - max activity
    ];
    return colors[level] || colors[0];
  };

  // Calculate level based on total minutes including current session
  const calculateLevelWithCurrentSession = (totalMinutes: number, isToday: boolean) => {
    const adjustedMinutes = isToday ? totalMinutes + currentSessionMinutes : totalMinutes;
    if (adjustedMinutes === 0) return 0;
    let level = 1;
    if (adjustedMinutes >= 30) level = 2;
    if (adjustedMinutes >= 60) level = 3;
    if (adjustedMinutes >= 120) level = 4;
    if (adjustedMinutes >= 180) level = 5;
    return level;
  };

  // Update heatmap data with current session
  const updatedHeatmapData = heatmapData.map(day => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const isToday = day.date === today;
    if (isToday && currentSessionMinutes > 0) {
      const newLevel = calculateLevelWithCurrentSession(day.totalMinutes, true);
      return {
        ...day,
        level: newLevel,
        totalMinutes: day.totalMinutes + currentSessionMinutes
      };
    }
    return day;
  });

  // Group days by weeks
  const weeks: Array<Array<any>> = [];
  let currentWeek: Array<any> = [];
  updatedHeatmapData.forEach((day, index) => {
    const dayOfWeek = getDay(new Date(day.date));
    if (index === 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Generate dynamic months from data
  const monthLabels: { index: number; label: string }[] = [];
  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const month = format(new Date(firstDay.date), 'MMM');
      if (!monthLabels.find(m => m.label === month)) {
        monthLabels.push({ index: weekIndex, label: month });
      }
    }
  });

  // Calculate total minutes including current session
  const totalMinutes = stats.totalMinutes + currentSessionMinutes;
  const totalSessions = stats.totalSessions + (currentSessionMinutes > 0 ? 1 : 0);

  return (
    <div className="w-full bg-slate-900/90 p-4 sm:p-6 lg:p-8 rounded-lg border border-slate-700/50">
      {/* Dynamic Month headers - perfectly aligned */}
      <div className="mb-3 sm:mb-4 ml-4 sm:ml-7">
        <div
          className="grid gap-1 text-xs text-slate-400"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((_, weekIndex) => {
            const month = monthLabels.find(m => m.index === weekIndex);
            return (
              <div key={weekIndex} className="text-center text-xs sm:text-sm">
                {month ? month.label : ''}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2 sm:mr-3 flex-shrink-0">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="text-xs text-slate-400 w-4 sm:w-6 h-2 sm:h-3 flex items-center justify-end"
            >
              {index % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid - FIXED: Using grid with 1fr for perfect alignment */}
        <div
          className="grid gap-1 flex-1"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const today = format(new Date(), 'yyyy-MM-dd');
                const isToday = day?.date === today;
                const isCurrentSession = isToday && currentSessionMinutes > 0;
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`aspect-square rounded-sm border border-slate-600/20 ${
                      day ? getLevelColor(day.level) : 'bg-slate-800/40'
                    } ${isCurrentSession ? 'ring-1 ring-emerald-300/70' : ''} 
                    hover:ring-1 hover:ring-slate-400/50 cursor-pointer transition-all duration-150`}
                    title={
                      day
                        ? `${day.date}: ${day.totalMinutes} minutes${
                            isCurrentSession ? ' (including current session)' : ''
                          }`
                        : ''
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer stats and legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-slate-400">
          <span className="font-medium text-white">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span> total • <span className="font-medium text-white">{totalSessions}</span> sessions
          {currentSessionMinutes > 0 && (
            <span className="text-emerald-400 ml-2 block sm:inline mt-1 sm:mt-0">
              (+{currentSessionMinutes}m ongoing)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-sm border border-slate-600/20 ${getLevelColor(level)}`}
                title={level === 0 ? 'No activity' : `Level ${level}`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">More</span>
        </div>
      </div>
    </div>
  );
}