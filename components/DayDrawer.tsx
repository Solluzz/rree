import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Fix: Added missing Leaf icon import from lucide-react
import { X, Droplets, Sparkles, CheckCircle2, Circle, Leaf } from 'lucide-react';
import { CareTask } from '../types';

interface DayDrawerProps {
  date: Date;
  tasks: CareTask[];
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  isOpen: boolean;
}

const DayDrawer: React.FC<DayDrawerProps> = ({ date, tasks, onClose, onToggleTask, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-accent/5 dark:bg-slate-800/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-emerald-100 capitalize font-serif">
              {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-accent font-medium">Suas tarefas</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Leaf size={32} />
              </div>
              <p className="text-slate-500 font-bold italic">Tudo limpo por aqui!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center p-4 rounded-2xl border transition-all cursor-pointer group
                  ${task.completed 
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-accent hover:shadow-md'}
                `}
                onClick={() => onToggleTask(task.id)}
              >
                <div className={`mr-4 p-3 rounded-2xl transition-colors ${
                  task.completed 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' 
                    : task.type === 'watering' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-500'
                }`}>
                  {task.type === 'watering' ? <Droplets size={24} /> : <Sparkles size={24} />}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-bold transition-colors ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                    {task.plantName}
                  </h4>
                  <p className={`text-[10px] uppercase tracking-wider font-black transition-colors ${task.completed ? 'text-slate-400' : 'text-accent'}`}>
                    {task.type === 'watering' ? 'Hidratação' : 'Nutrição'}
                  </p>
                </div>

                <div className={`${task.completed ? 'text-accent' : 'text-slate-200 dark:text-slate-700 group-hover:text-accent/40'}`}>
                  {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="bg-accent text-white p-5 rounded-3xl flex items-start gap-3 shadow-lg shadow-accent/20">
            <span className="text-2xl">🌱</span>
            <p className="text-xs italic font-bold opacity-90 leading-relaxed">
              Dica: Verifique a umidade do solo com o dedo antes de regar, mesmo se o app disser que é hora!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDrawer;