import React, { useState, useEffect } from 'react';
import type { Entity } from '../types/finance';
import { XIcon, LandmarkIcon } from './ui/Icons';
import { EdgeGlow } from './ui/EdgeGlow';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  initialEntity?: Entity | null;
}

const COLOR_PALETTE = [
  { label: 'Índigo', hex: '#6366f1' },
  { label: 'Esmeralda', hex: '#10b981' },
  { label: 'Púrpura', hex: '#a855f7' },
  { label: 'Ámbar', hex: '#f59e0b' },
  { label: 'Cian', hex: '#06b6d4' },
  { label: 'Rosa', hex: '#ec4899' },
  { label: 'Azul', hex: '#3b82f6' },
];

export const EntityModal: React.FC<EntityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntity,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0].hex);

  useEffect(() => {
    if (initialEntity) {
      setName(initialEntity.name);
      setColor(initialEntity.color || COLOR_PALETTE[0].hex);
    } else {
      setName('');
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].hex);
    }
  }, [initialEntity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative overflow-hidden w-full max-w-md liquid-glass rounded-3xl p-6 border border-white/20 dark:border-zinc-700/40 shadow-2xl">
        {/* Brillo dinámico en las orillas de la ventana modal */}
        <EdgeGlow color={color} proximity={240} size={380} />

        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <LandmarkIcon size={18} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {initialEntity ? 'Editar Entidad' : 'Nueva Entidad Financiera'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nombre de la Entidad o Plataforma
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Entidad A, Fondo Gubernamental, Plataforma Digital"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl liquid-glass-input text-sm text-zinc-900 dark:text-white"
              autoFocus
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Etiqueta libre y privada, guardada exclusivamente en tu dispositivo.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Color Distintivo
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    color === c.hex
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                      : 'hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="relative overflow-hidden px-4 py-2 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              <EdgeGlow color="rgba(99, 102, 241, 0.85)" proximity={150} size={200} />
              Cancelar
            </button>
            <button
              type="submit"
              className="relative overflow-hidden px-5 py-2 rounded-2xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <EdgeGlow color="rgba(255, 255, 255, 0.95)" proximity={160} size={220} />
              {initialEntity ? 'Actualizar' : 'Crear Entidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
