import React, { useState, useEffect } from 'react';
import { DateDisplayProps } from './types';
import { formatDate } from './utils';

// Component d'affichage de la date/heure
export function DateDisplay({ date, onDateSelect, showDatePicker, toggleDatePicker, isLiveDate, isFullscreen }: DateDisplayProps) {
  const [dateInput, setDateInput] = useState<string>('');
  const [timeInput, setTimeInput] = useState<string>('');
  
  // Initialiser les inputs de date/heure avec la date actuelle
  useEffect(() => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    setDateInput(`${year}-${month}-${day}`);
    setTimeInput(`${hours}:${minutes}`);
  }, [date]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dateInput) {
      const [year, month, day] = dateInput.split('-').map(Number);
      const [hours, minutes] = timeInput ? timeInput.split(':').map(Number) : [0, 0];
      
      const newDate = new Date(year, month - 1, day, hours, minutes);
      onDateSelect(newDate);
      toggleDatePicker();
    }
  };

  // Ajouter/soustraire des jours à la date actuelle
  const adjustDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    onDateSelect(newDate);
  };

  // Boutons de navigation rapide
  const quickNavButtons = [
    { label: '-1 an', days: -365 },
    { label: '-1 mois', days: -30 },
    { label: '-1 jour', days: -1 },
    { label: '+1 jour', days: 1 },
    { label: '+1 mois', days: 30 },
    { label: '+1 an', days: 365 },
  ];
  
  // Adapter le style en fonction du mode plein écran
  const containerClassName = isFullscreen 
    ? "w-full bg-black/80 backdrop-blur-md rounded-md text-white px-3 py-2 text-[10px] xs:text-xs sm:text-sm border border-gray-700/40 shadow-lg" 
    : "absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/70 backdrop-blur-md rounded-md text-white px-3 py-2 text-[10px] xs:text-xs sm:text-sm z-30 border border-gray-700/30 shadow-lg";
  
  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium flex items-center">
            Position des planètes au:
          </div>
          <div className={`max-w-[110px] xs:max-w-[150px] sm:max-w-none truncate ${isLiveDate ? 'text-blue-300' : 'text-purple-300'}`}>
            {formatDate(date)}
          </div>
        </div>
        <button 
          className={`cursor-pointer ml-2 sm:ml-4 p-1 sm:p-1.5 rounded-md transition-colors ${showDatePicker ? 'bg-blue-600/70' : 'hover:bg-blue-600/50'}`}
          onClick={toggleDatePicker}
          title="Choisir une date"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {showDatePicker && (
        <div className={`mt-2 sm:mt-3 p-3 sm:p-4 bg-gray-800/90 rounded-md shadow-lg border border-gray-700/30 ${isFullscreen ? '' : 'absolute left-0 right-0'} z-40`}>
          {/* Navigation rapide */}
          <div className="mb-3 grid grid-cols-3 gap-1">
            {quickNavButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => adjustDate(btn.days)}
                className="cursor-pointer text-[8px] xs:text-[9px] py-1 px-1 rounded bg-gray-700/70 hover:bg-gray-600 transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[9px] xs:text-[10px] font-medium">Date:</label>
                <input 
                  type="date" 
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-[9px] xs:text-[10px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] xs:text-[10px] font-medium">Heure:</label>
                <input 
                  type="time" 
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-[9px] xs:text-[10px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex">
              <button 
                type="submit"
                className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-2 py-1.5 rounded-md text-[10px] xs:text-xs font-medium shadow-md shadow-blue-500/20 transition-all"
              >
                Appliquer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 