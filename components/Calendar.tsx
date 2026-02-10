
import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CareTask, Plant } from '../types';

interface CalendarProps {
  tasks: CareTask[];
  plants: Plant[];
  onDayClick: (date: Date) => void;
  selectedDate: Date;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, plants, onDayClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-accent text-white rounded-t-2xl shadow-sm">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-black/10 rounded-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-sm md:text-base font-bold capitalize font-serif tracking-tight">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-black/10 rounded-lg transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return (
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        {days.map((day, idx) => (
          <div key={idx} className="py-2 text-center text-[8px] md:text-[10px] font-black text-accent/60 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`relative h-16 md:h-20 border-r border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col items-center justify-start pt-2 overflow-hidden
              ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-300 dark:text-slate-800' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'}
              ${isSameDay(day, selectedDate) ? 'bg-accent/5 dark:bg-accent/10' : ''}
              ${isSameDay(day, new Date()) ? 'ring-1 ring-inset ring-accent/20' : ''}
            `}
            onClick={() => onDayClick(cloneDay)}
          >
            <span className={`text-[10px] md:text-xs font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg transition-all
              ${isSameDay(day, new Date()) ? 'bg-accent text-white shadow-sm' : ''}
              ${isSameDay(day, selectedDate) && !isSameDay(day, new Date()) ? 'bg-accent/20 text-accent' : ''}
            `}>
              {format(day, 'd')}
            </span>
            
            <div className="flex flex-wrap gap-1 mt-1 md:mt-2 w-full justify-center px-1 overflow-hidden">
              {dayTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${task.type === 'watering' ? 'bg-blue-500' : 'bg-orange-500'} ${task.completed ? 'opacity-20' : ''}`}
                />
              ))}
              {dayTasks.length > 4 && (
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-300" />
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="bg-white dark:bg-slate-900 rounded-b-2xl shadow-sm overflow-hidden border-l border-slate-100 dark:border-slate-800">{rows}</div>;
  };

  return (
    <div className="w-full max-w-[450px] md:max-w-[520px] mx-auto animate-in fade-in zoom-in-95 duration-300">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
