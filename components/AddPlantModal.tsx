import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Leaf, CalendarClock } from 'lucide-react';
import { Plant } from '../types';
import { addDays } from 'date-fns';

interface AddPlantModalProps {
  onClose: () => void;
  onAdd: (plant: Omit<Plant, 'id'>) => void;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    wateringFrequency: 3,
    fertilizationFrequency: 30,
    startInDays: 0,
    image: '',
    notes: ''
  });
  
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }
      setStream(mediaStream);
      setCameraMode(true);
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setFormData(prev => ({ ...prev, image: base64 }));
      stopCamera();
    }
  };

  useEffect(() => {
    if (cameraMode && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => stopCamera();
  }, [cameraMode, stream]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseDate = addDays(new Date(), formData.startInDays - formData.wateringFrequency);
    const fertilizationBase = addDays(new Date(), formData.startInDays - formData.fertilizationFrequency);

    onAdd({
      name: formData.name,
      species: formData.species,
      wateringFrequency: formData.wateringFrequency,
      fertilizationFrequency: formData.fertilizationFrequency,
      image: formData.image || 'https://images.unsplash.com/photo-1545239351-ef056c0b011a?q=80&w=400&auto=format&fit=crop',
      lastWatered: baseDate.toISOString(),
      lastFertilized: fertilizationBase.toISOString(),
      notes: formData.notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 transition-colors">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-serif">Nova Amiga Verde</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex flex-col items-center">
            {cameraMode ? (
              <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative border-2 border-black dark:border-white shadow-xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <button type="button" onClick={takePhoto} className="p-4 bg-white text-black rounded-full shadow-lg active:scale-90 transition-transform">
                    <Camera size={24} />
                  </button>
                  <button type="button" onClick={stopCamera} className="p-4 bg-red-500 text-white rounded-full shadow-lg active:scale-90 transition-transform">
                    <X size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-2xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden group border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 opacity-30 dark:opacity-20 text-slate-900 dark:text-slate-100">
                        <Leaf size={32} className="mx-auto mb-1" />
                        <span className="text-[8px] font-bold uppercase block">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button type="button" onClick={startCamera} className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Camera size={18} />
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Upload size={18} />
                      </button>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase mb-1">Apelido</label>
                      <input 
                        type="text" required
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white transition-colors"
                        placeholder="Ex: Jiboia"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase mb-1">Espécie</label>
                      <input 
                        type="text"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white transition-colors"
                        placeholder="Opcional"
                        value={formData.species}
                        onChange={e => setFormData(prev => ({ ...prev, species: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
             <div className="flex items-center gap-2 mb-1">
                <CalendarClock size={16} className="text-black dark:text-white" />
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Rotina</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Rega (dias)</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 px-3">
                    <input 
                      type="number" min="1"
                      className="w-full py-2 text-sm outline-none bg-transparent dark:text-white"
                      value={formData.wateringFrequency}
                      onChange={e => setFormData(prev => ({ ...prev, wateringFrequency: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Adubo (dias)</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 px-3">
                    <input 
                      type="number" min="1"
                      className="w-full py-2 text-sm outline-none bg-transparent dark:text-white"
                      value={formData.fertilizationFrequency}
                      onChange={e => setFormData(prev => ({ ...prev, fertilizationFrequency: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
             </div>

             <div>
                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Iniciar em quantos dias?</label>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 px-3">
                    <input 
                      type="number" min="0"
                      className="w-full py-2 text-sm outline-none bg-transparent dark:text-white"
                      value={formData.startInDays}
                      onChange={e => setFormData(prev => ({ ...prev, startInDays: parseInt(e.target.value) }))}
                    />
                    <span className="text-[9px] font-bold text-black dark:text-white">dias</span>
                </div>
             </div>
          </div>

          <button 
            type="submit"
            disabled={cameraMode}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm shadow-xl hover:opacity-90 transition-all active:scale-[0.98] mt-2 uppercase tracking-widest"
          >
            Salvar Planta
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;