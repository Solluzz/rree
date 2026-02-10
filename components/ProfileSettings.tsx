
import React, { useState, useRef } from 'react';
import { X, Moon, Sun, Palette, Bell, Check, UserCircle, Database, Download, Upload, Trash2 } from 'lucide-react';

interface ProfileSettingsProps {
  onClose: () => void;
  profile: { name: string; email: string; age: string };
  onSave: (data: { profile: any; isDarkMode: boolean; activePalette: any }) => void;
  isDarkMode: boolean;
  activePalette: string;
  palettes: any;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ 
  onClose, profile, onSave, isDarkMode, activePalette, palettes, onExport, onImport, onReset
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'data'>('profile');
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);
  const [localActivePalette, setLocalActivePalette] = useState(activePalette);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({
      profile: localProfile,
      isDarkMode: localIsDarkMode,
      activePalette: localActivePalette
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
              <UserCircle size={24} />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Configurações</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex relative overflow-hidden">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(33.33%-4px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-out 
                ${activeTab === 'profile' ? 'translate-x-0' : activeTab === 'appearance' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-[calc(200%+8px)]'}`}
            />
            <button onClick={() => setActiveTab('profile')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider relative z-10 transition-colors ${activeTab === 'profile' ? 'text-accent' : 'text-slate-400'}`}>Perfil</button>
            <button onClick={() => setActiveTab('appearance')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider relative z-10 transition-colors ${activeTab === 'appearance' ? 'text-accent' : 'text-slate-400'}`}>Visual</button>
            <button onClick={() => setActiveTab('data')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider relative z-10 transition-colors ${activeTab === 'data' ? 'text-accent' : 'text-slate-400'}`}>Dados</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 h-[400px] overflow-y-auto relative scroll-smooth">
          
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Dados da Conta</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Nome Completo</label>
                  <input type="text" value={localProfile.name} onChange={e => setLocalProfile({...localProfile, name: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-accent dark:text-white" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">E-mail</label>
                    <input type="email" value={localProfile.email} onChange={e => setLocalProfile({...localProfile, email: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-accent dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Idade</label>
                    <input type="number" value={localProfile.age} onChange={e => setLocalProfile({...localProfile, age: e.target.value})} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-accent dark:text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personalização</h4>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${localIsDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                    {localIsDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <span className="text-sm font-bold dark:text-white">Interface Escura</span>
                </div>
                <button onClick={() => setLocalIsDarkMode(!localIsDarkMode)} className={`w-12 h-6 rounded-full relative transition-all ${localIsDarkMode ? 'bg-accent' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localIsDarkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Paleta de Cores</span>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(palettes).map(([key, colors]: [any, any]) => (
                    <button key={key} onClick={() => setLocalActivePalette(key)} className={`aspect-square rounded-2xl border-2 transition-all ${localActivePalette === key ? 'border-accent ring-4 ring-accent/10' : 'border-transparent'}`} style={{ backgroundColor: colors.main }}>
                      {localActivePalette === key && <Check size={18} className="text-white m-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gerenciamento de Dados</h4>
              <div className="space-y-3">
                <button onClick={onExport} className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <Download className="text-accent" size={20} />
                    <div className="text-left">
                      <p className="text-sm font-bold dark:text-white">Exportar Backup</p>
                      <p className="text-[10px] text-slate-400">Salvar arquivo .json no PC</p>
                    </div>
                  </div>
                  <Check size={16} className="opacity-0 group-active:opacity-100 text-accent transition-opacity" />
                </button>

                <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <Upload className="text-blue-500" size={20} />
                    <div className="text-left">
                      <p className="text-sm font-bold dark:text-white">Importar Dados</p>
                      <p className="text-[10px] text-slate-400">Carregar arquivo de backup</p>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
                </button>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={onReset} className="w-full p-4 flex items-center gap-3 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-2xl border border-red-100 dark:border-red-900/30 transition-all">
                    <Trash2 size={20} />
                    <div className="text-left">
                      <p className="text-sm font-bold">Limpar Tudo</p>
                      <p className="text-[10px] opacity-70">Apagar todas as plantas e histórico</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleSave} className="w-full py-4 bg-accent text-white rounded-2xl font-black text-xs shadow-xl uppercase tracking-widest">
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
