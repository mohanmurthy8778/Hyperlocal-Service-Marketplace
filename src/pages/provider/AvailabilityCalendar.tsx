import React, { useState } from 'react';
import { Calendar as LucideCalendar, Clock, Check, Save, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';

export const AvailabilityCalendar: React.FC = () => {
  const { toast } = useApp();

  const [weekdays, setWeekdays] = useState([
    { day: 'Monday', active: true, hours: '9:00 AM - 6:00 PM' },
    { day: 'Tuesday', active: true, hours: '9:00 AM - 6:00 PM' },
    { day: 'Wednesday', active: true, hours: '9:00 AM - 6:00 PM' },
    { day: 'Thursday', active: true, hours: '9:00 AM - 6:00 PM' },
    { day: 'Friday', active: true, hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', active: true, hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', active: false, hours: 'Off' }
  ]);

  const [selectedMonth, setSelectedMonth] = useState('July 2026');

  // Interactive calendars dates
  const [blockedDates, setBlockedDates] = useState<number[]>([12, 19, 26]); // Sunday blockouts

  const handleDayToggle = (idx: number) => {
    const updated = [...weekdays];
    updated[idx].active = !updated[idx].active;
    if (!updated[idx].active) {
      updated[idx].hours = 'Off';
    } else {
      updated[idx].hours = idx === 5 ? '10:00 AM - 4:00 PM' : '9:00 AM - 6:00 PM';
    }
    setWeekdays(updated);
  };

  const handleDateClick = (day: number) => {
    if (blockedDates.includes(day)) {
      setBlockedDates(blockedDates.filter(d => d !== day));
      toast(`Unlocked availability for July ${day}, 2026`, 'success');
    } else {
      setBlockedDates([...blockedDates, day]);
      toast(`Blocked scheduling for July ${day}, 2026`, 'info');
    }
  };

  const handleSaveSettings = () => {
    toast('Availability calendar settings synced successfully!', 'success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 animate-fade-in" id="availability-page">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-text">Availability Calendar</h1>
          <p className="text-xs text-secondary-text mt-1">Designate working days, block personal holidays, and set dispatch hours.</p>
        </div>

        <Link
          to="/provider"
          className="px-3.5 py-1.5 border border-border-primary hover:bg-bg-secondary text-xs font-bold text-secondary-text rounded-xl flex items-center gap-1.5 dark:border-border-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (Col Span 2): Month Calendar bento */}
        <div className="lg:col-span-2 bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-primary-text flex items-center gap-1.5">
              <LucideCalendar className="h-4.5 w-4.5 text-primary" />
              <span>{selectedMonth} Schedule</span>
            </h3>
            <span className="text-[10px] text-secondary-text font-semibold block">Click date to block / unblock bookings</span>
          </div>

          {/* Render Calendar grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-secondary-text">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <span key={day}>{day}</span>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Blank placeholders for empty grid start offsets */}
            {Array.from({ length: 2 }).map((_, i) => <div key={i} />)}
            
            {/* 31 days in July */}
            {Array.from({ length: 31 }).map((_, idx) => {
              const dayNum = idx + 1;
              const isBlocked = blockedDates.includes(dayNum);
              return (
                <button
                  key={dayNum}
                  onClick={() => handleDateClick(dayNum)}
                  className={`h-11 rounded-xl text-xs font-extrabold flex flex-col items-center justify-center border transition-all ${
                    isBlocked
                      ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/40'
                      : 'bg-bg-card border-border-primary text-secondary-text dark:bg-bg-card dark:border-border-primary dark:text-secondary-text hover:border-primary'
                  }`}
                >
                  <span>{dayNum}</span>
                  <span className={`h-1.5 w-1.5 rounded-full mt-1 ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-[10px] font-bold text-secondary-text uppercase tracking-wider pt-2 border-t border-border-primary dark:border-border-primary">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Available / Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span>Blocked / Off</span>
            </div>
          </div>
        </div>

        {/* Right Col: Weekday Schedules toggles */}
        <div className="bg-bg-card rounded-2xl border border-border-primary p-6 dark:border-border-primary shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-primary-text flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-primary" />
            <span>Weekly Work Hours</span>
          </h3>

          <div className="space-y-4">
            {weekdays.map((wd, i) => (
              <div key={wd.day} className="flex items-center justify-between border-b border-border-primary dark:border-border-primary pb-3 last:border-0 last:pb-0">
                <div>
                  <span className="text-xs font-bold text-primary-text block">{wd.day}</span>
                  <span className="text-[10px] text-secondary-text font-semibold">{wd.hours}</span>
                </div>

                <button
                  onClick={() => handleDayToggle(i)}
                  className={`h-6 w-11 rounded-full p-0.5 transition-all outline-none ${wd.active ? 'bg-primary' : 'bg-gray-200 dark:bg-bg-card'}`}
                >
                  <div className={`h-5 w-5 rounded-full bg-bg-card transition-all transform ${wd.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-charcoal flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
          >
            <Save className="h-4.5 w-4.5" />
            <span>Save Hours Settings</span>
          </button>
        </div>

      </div>

    </div>
  );
};
