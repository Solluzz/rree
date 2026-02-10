
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Leaf, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Search, 
  Droplets, 
  Sparkles,
  User,
  StickyNote,
  FileText
} from 'lucide-react';
import { addDays, isSameDay, parseISO, startOfDay, format, isAfter, isBefore } from 'date-fns';
import Calendar from './components/Calendar';
import DayDrawer from './components/DayDrawer';
import AddPlantModal from './components/AddPlantModal';
import ProfileSettings from './components/ProfileSettings';
import { Plant, CareTask, TaskType } from './types';

const INITIAL_PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Jiboia Dourada',
    species: 'Epipremnum aureum',
    wateringFrequency: 4,
    fertilizationFrequency: 30,
    lastWatered: new Date().toISOString(),
    lastFertilized: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1597055181300-e3633a207519?q=80&w=400&auto=format&fit=crop',
    notes: 'Adora luz indireta e umidade.'
  }
];

const PALETTES = {
  emerald: { main: '#000000', light: '#f8fafc', dark: '#000000' },
  ocean: { main: '#0284c7', light: '#e0f2fe', dark: '#0c4a6e' },
  lavender: { main: '#8b5cf6', light: '#ede9fe', dark: '#4c1d95' },
  rose: { main: '#e11d48', light: '#ffe4e6', dark: '#881337' },
  amber: { main: '#d97706', light: '#fef3c7', dark: '#78350f' }
};

const App: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('pedraverde_plants');
    return saved ? JSON.parse(saved) : INITIAL_PLANTS;
  });
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('pedraverde_completed');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [globalNotes, setGlobalNotes] = useState(() => {
    return localStorage.getItem('pedraverde_global_notes') || '';
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'plants'>('calendar');
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activePalette, setActivePalette] = useState<keyof typeof PALETTES>(() => (localStorage.getItem('palette') as any) || 'emerald');
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : { name: '', email: '', age: '' };
  });

  useEffect(() => {
    localStorage.setItem('pedraverde_plants', JSON.stringify(plants));
  }, [plants]);

  useEffect(() => {
    localStorage.setItem('pedraverde_completed', JSON.stringify(Array.from(completedTaskIds)));
  }, [completedTaskIds]);

  useEffect(() => {
    localStorage.setItem('pedraverde_global_notes', globalNotes);
  }, [globalNotes]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const palette = PALETTES[activePalette];
    const root = document.documentElement;
    root.style.setProperty('--accent-color', palette.main);
    root.style.setProperty('--accent-light', palette.light);
    root.style.setProperty('--accent-dark', palette.dark);
    localStorage.setItem('palette', activePalette);
  }, [activePalette]);

  const tasks = useMemo(() => {
    const allTasks: CareTask[] = [];
    const today = startOfDay(new Date());
    const windowStart = addDays(today, -30);
    const windowEnd = addDays(today, 60);

    plants.forEach(plant => {
      const createTypeTasks = (type: TaskType, baseDate: string, freq: number) => {
        const start = startOfDay(parseISO(baseDate));
        for (let i = -10; i < 25; i++) {
          const tDate = addDays(start, i * freq);
          if (isAfter(tDate, windowStart) && isBefore(tDate, windowEnd)) {
            const taskId = `${type}-${plant.id}-${format(tDate, 'yyyy-MM-dd')}`;
            allTasks.push({
              id: taskId,
              plantId: plant.id,
              plantName: plant.name,
              type,
              dueDate: tDate.toISOString(),
              completed: completedTaskIds.has(taskId) || (isBefore(tDate, today) && !isSameDay(tDate, today))
            });
          }
        }
      };
      createTypeTasks('watering', plant.lastWatered, plant.wateringFrequency);
      createTypeTasks('fertilization', plant.lastFertilized, plant.fertilizationFrequency);
    });
    return allTasks;
  }, [plants, completedTaskIds]);

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.completed) {
      setCompletedTaskIds(prev => new Set(prev).add(taskId));
      const tDate = parseISO(task.dueDate);
      setPlants(prev => prev.map(p => {
        if (p.id === task.plantId) {
          const field = task.type === 'watering' ? 'lastWatered' : 'lastFertilized';
          const currentLast = parseISO(p[field]);
          if (isAfter(tDate, currentLast) || isSameDay(tDate, currentLast)) {
            return { ...p, [field]: tDate.toISOString() };
          }
        }
        return p;
      }));
    } else {
      setCompletedTaskIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleSaveProfileSettings = (data: { profile: any, isDarkMode: boolean, activePalette: any }) => {
    setUserProfile(data.profile);
    localStorage.setItem('user_profile', JSON.stringify(data.profile));
    setIsDarkMode(data.isDarkMode);
    setActivePalette(data.activePalette);
  };

  const handleExportData = () => {
    const data = {
      plants,
      completedTaskIds: Array.from(completedTaskIds),
      userProfile,
      globalNotes,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedraverde_backup_${format(new Date(), 'ddMMyyyy')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.plants && data.completedTaskIds) {
          setPlants(data.plants);
          setCompletedTaskIds(new Set(data.completedTaskIds));
          if (data.userProfile) setUserProfile(data.userProfile);
          if (data.globalNotes) setGlobalNotes(data.globalNotes);
          alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo de backup. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Tem certeza que deseja apagar os dados de plantas e histórico? Suas notas rápidas serão mantidas.')) {
      setPlants(INITIAL_PLANTS);
      setCompletedTaskIds(new Set());
      // Nota mantida conforme solicitado: "fixa ate que o usuario apague por conta propria"
      localStorage.removeItem('pedraverde_plants');
      localStorage.removeItem('pedraverde_completed');
      window.location.reload();
    }
  };

  const filteredPlants = plants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col items-center py-6 gap-6 z-40">
        <div className="p-3 bg-accent rounded-xl text-white shadow-md cursor-default">
          <Leaf size={24} />
        </div>
        <nav className="flex flex-col gap-4">
          <button onClick={() => setActiveTab('calendar')} className={`p-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-accent'}`}>
            <CalendarIcon size={20} />
          </button>
          <button onClick={() => setActiveTab('plants')} className={`p-3 rounded-xl transition-all ${activeTab === 'plants' ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-accent'}`}>
            <LayoutGrid size={20} />
          </button>
          <button onClick={() => setIsProfileOpen(true)} className="p-3 rounded-xl text-slate-400 hover:text-accent">
            <User size={20} />
          </button>
        </nav>
        <div className="mt-auto">
          <button onClick={() => setIsModalOpen(true)} className="p-3 bg-accent text-white rounded-xl shadow-md hover:scale-105 transition-transform">
            <Plus size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-2xl md:text-3xl font-serif tracking-tighter text-slate-900 dark:text-white">
                  Pedra<span className="text-accent">Verde</span>
                </h1>
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Gestão Botânica</p>
              </div>
              <div className="md:hidden">
                 <button onClick={() => setIsProfileOpen(true)} className="p-2 text-slate-400">
                    <User size={20} />
                 </button>
              </div>
            </div>
            <div className="relative w-full shadow-sm max-w-[520px] mx-auto animate-in fade-in duration-700 delay-150">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" placeholder="Procurar na selva..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white text-xs md:text-sm focus:ring-1 focus:ring-accent transition-all"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-center min-h-0">
            {activeTab === 'calendar' ? (
              <div className="flex-1 flex items-center justify-center p-2">
                <Calendar tasks={tasks} plants={plants} onDayClick={(d) => { setSelectedDate(d); setIsDrawerOpen(true); }} selectedDate={selectedDate} />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
                {filteredPlants.map(plant => (
                  <div key={plant.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">{plant.name}</h3>
                      <div className="flex gap-3 mt-2">
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-blue-500 font-bold">
                          <Droplets size={12} /> {plant.wateringFrequency}d
                        </div>
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-orange-500 font-bold">
                          <Sparkles size={12} /> {plant.fertilizationFrequency}d
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas Rápidas - Estilo fixo e persistente conforme imagem */}
          <section className="mt-auto mb-20 md:mb-10 max-w-[520px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="bg-[#f3f4f6] dark:bg-slate-900/40 rounded-[2rem] p-4 md:p-6 border border-[#e5e7eb] dark:border-slate-800 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <FileText size={18} className="text-slate-800 dark:text-slate-200" />
                <h2 className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">Notas Rápidas</h2>
              </div>
              <div className="bg-white dark:bg-slate-950 rounded-[1.5rem] p-1 border border-[#f1f5f9] dark:border-slate-800 shadow-inner">
                <textarea 
                  className="w-full min-h-[100px] md:min-h-[120px] p-4 bg-transparent border-none outline-none text-xs md:text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 resize-none transition-all"
                  placeholder="Escreva aqui lembretes que você quer manter sempre à mão..."
                  value={globalNotes}
                  onChange={(e) => setGlobalNotes(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-[60] flex items-center justify-around px-6">
          <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-accent' : 'text-slate-400'}`}>
            <CalendarIcon size={20} />
            <span className="text-[8px] font-bold uppercase">Agenda</span>
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg -translate-y-4 border-4 border-slate-50 dark:border-slate-950"
          >
            <Plus size={24} />
          </button>

          <button onClick={() => setActiveTab('plants')} className={`flex flex-col items-center gap-1 ${activeTab === 'plants' ? 'text-accent' : 'text-slate-400'}`}>
            <LayoutGrid size={20} />
            <span className="text-[8px] font-bold uppercase">Plantas</span>
          </button>
      </nav>

      <DayDrawer 
        date={selectedDate} tasks={tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate))} 
        onClose={() => setIsDrawerOpen(false)} 
        onToggleTask={handleToggleTask} isOpen={isDrawerOpen} 
      />
      {isModalOpen && <AddPlantModal onClose={() => setIsModalOpen(false)} onAdd={(p) => setPlants(prev => [...prev, { ...p, id: Date.now().toString() }])} />}
      {isProfileOpen && (
        <ProfileSettings 
          onClose={() => setIsProfileOpen(false)}
          profile={userProfile}
          onSave={handleSaveProfileSettings}
          isDarkMode={isDarkMode}
          activePalette={activePalette}
          palettes={PALETTES}
          onExport={handleExportData}
          onImport={handleImportData}
          onReset={handleResetData}
        />
      )}
    </div>
  );
};

export default App;
