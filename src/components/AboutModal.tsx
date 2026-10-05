import React, { useState, useRef } from 'react';
import {
  XIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  DownloadIcon,
  UploadIcon,
  RefreshIcon,
  TrashIcon,
  SparklesIcon,
  PercentIcon,
  TrendingUpIcon,
} from './ui/Icons';
import type { Entity } from '../types/finance';
import { exportPortfolioToJSON, importPortfolioFromJSON } from '../utils/storage';
import { EdgeGlow } from './ui/EdgeGlow';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: Entity[];
  onImport: (entities: Entity[]) => void;
  onReset: () => void;
  onClear: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  entities,
  onImport,
  onReset,
  onClear,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'learn' | 'backup'>('about');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = exportPortfolioToJSON(entities);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portafolio-rendimientos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importPortfolioFromJSON(content);
        onImport(imported);
        alert('Portafolio importado con éxito');
      } catch (err: any) {
        alert('Error al importar archivo: ' + (err.message || 'Formato no válido'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative overflow-hidden w-full max-w-3xl liquid-glass glass-corner-flare rounded-3xl p-6 sm:p-7 my-8 border border-white/80 dark:border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Brillo dinámico en las orillas de la ventana modal */}
        <EdgeGlow color="rgba(99, 102, 241, 0.95)" proximity={240} size={500} />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <SparklesIcon size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Centro de Información y Datos
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Calculadora de Rendimientos Multi-Fuente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-zinc-800 text-slate-500 transition-colors cursor-pointer"
          >
            <XIcon size={19} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-2xl bg-slate-200/50 dark:bg-black/30 border border-white/40 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheckIcon size={14} />
            <span>Acerca del Proyecto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'learn'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpenIcon size={14} />
            <span>Conocer Más</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DownloadIcon size={14} />
            <span>Respaldo y Datos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4 overflow-y-auto pr-1 flex-1 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          {/* TAB 1: ACERCA DEL PROYECTO */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <ShieldCheckIcon size={16} />
                  <span>Privacidad Total y Cero Custodia</span>
                </div>
                <p>
                  Esta herramienta está diseñada bajo la arquitectura <strong>Client-Side Only</strong>. Todos los datos, montos, entidades y configuraciones de inversión se almacenan exclusivamente en el almacenamiento local (<code>localStorage</code>) de tu navegador.
                </p>
                <p>
                  Ningún dato financiero es transmitido a servidores remotos ni recopilado por cookies o rastreadores analíticos.
                </p>
              </div>

              <div className="p-4 rounded-2xl liquid-glass-subtle border border-slate-200/80 dark:border-white/10 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Metodología de Cálculo Financiero
                </h4>
                <p>
                  La calculadora resuelve la complejidad del interés compuesto cuando los fondos están divididos en diferentes entidades y reglas:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-zinc-400">
                  <li><strong>Tasa Ponderada Global:</strong> Calcula el rendimiento total anual sobre el capital consolidado activo.</li>
                  <li><strong>Capitalización Real:</strong> Respeta frecuencias diarias, mensuales o a vencimiento.</li>
                  <li><strong>Aportaciones Recurrentes:</strong> Simula el crecimiento continuo sumando depósitos periódicos según la cadencia seleccionada.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                <strong>Aviso Informativo:</strong> Esta herramienta tiene fines exclusivamente educativos y de simulación financiera. Las tasas de interés, topes institucionales y condiciones fiscales (como retención de ISR o exenciones de SOFIPOs) pueden variar según la regulación vigente de cada entidad.
              </div>
            </div>
          )}

          {/* TAB 2: CONOCER MÁS */}
          {activeTab === 'learn' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-purple-500/20 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <PercentIcon size={16} />
                  <span>Reglas Escalonadas y Topes de Inversión</span>
                </div>
                <p>
                  En México y Latinoamérica, diversas entidades (especialmente SOFIPOs y neobancos) ofrecen rendimientos preferenciales con límites:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-purple-500/20">
                    <strong className="block text-slate-900 dark:text-white mb-1">
                      1. Límite con Reinversión a Tasa Máxima
                    </strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      No puedes depositar más del límite (ej. $25,000), pero los rendimientos devengados generados dentro de la cuenta continúan capitalizando a la tasa máxima del 100%.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-purple-500/20">
                    <strong className="block text-slate-900 dark:text-white mb-1">
                      2. Límite Estricto con Excedente
                    </strong>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Solo el saldo hasta el límite fijado recibe la tasa máxima. Cualquier rendimiento o depósito que supere el límite recibe una tasa menor o 0%.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass-subtle border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-sm">
                  <TrendingUpIcon size={16} />
                  <span>El Poder del Interés Compuesto y Aportaciones</span>
                </div>
                <p>
                  Al activar aportaciones periódicas (semanales, quincenales o mensuales), aceleras el crecimiento exponencial del patrimonio. La brecha de riqueza en la gráfica ilustra la ganancia neta generada puramente por intereses reinvertidos contra el capital aportado.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: RESPALDO Y GESTIÓN DE DATOS */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-indigo-500/20 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Exportar e Importar Respaldo
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Descarga una copia completa de tus entidades y apartados en formato JSON para respaldarla o transferirla a otro dispositivo sin intermediarios.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="relative overflow-hidden px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <EdgeGlow color="rgba(255, 255, 255, 0.95)" proximity={170} size={250} />
                    <DownloadIcon size={14} />
                    <span>Exportar Respaldo JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative overflow-hidden px-4 py-2 rounded-xl text-xs font-semibold liquid-glass-subtle text-slate-700 dark:text-zinc-200 hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <EdgeGlow color="rgba(99, 102, 241, 0.9)" proximity={170} size={250} />
                    <UploadIcon size={14} />
                    <span>Importar Respaldo JSON</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl liquid-glass-subtle border border-slate-200/80 dark:border-white/10 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Mantenimiento de Datos Locales
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {showConfirmReset ? (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">¿Cargar datos de ejemplo?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onReset();
                          setShowConfirmReset(false);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white cursor-pointer"
                      >
                        Sí, restablecer
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmReset(false)}
                        className="px-2 py-1 text-xs text-slate-500 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshIcon size={13} />
                      <span>Cargar Datos de Ejemplo</span>
                    </button>
                  )}

                  {showConfirmClear ? (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">¿Borrar todas las cuentas?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClear();
                          setShowConfirmClear(false);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white cursor-pointer"
                      >
                        Sí, borrar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmClear(false)}
                        className="px-2 py-1 text-xs text-slate-500 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirmClear(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <TrashIcon size={13} />
                      <span>Limpiar Datos</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="relative overflow-hidden px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-300/80 dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <EdgeGlow color="rgba(99, 102, 241, 0.95)" proximity={160} size={220} />
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
