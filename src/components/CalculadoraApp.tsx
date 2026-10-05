import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Entity, Apartado } from '../types/finance';
import {
  loadPortfolioFromStorage,
  savePortfolioToStorage,
  resetPortfolioToDefault,
  clearPortfolioData,
} from '../utils/storage';
import { calculatePortfolioSummary } from '../utils/finance';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { Navbar } from './Navbar';
import { KpiCards } from './KpiCards';
import { ChartProjection } from './ChartProjection';
import { EntityCard } from './EntityCard';
import { ApartadoModal } from './ApartadoModal';
import { EntityModal } from './EntityModal';
import { AboutModal } from './AboutModal';
import { InstitutionYieldCards } from './InstitutionYieldCards';
import { InstitutionDetailModal } from './InstitutionDetailModal';
import { FocalContainer } from './ui/FocalContainer';
import { EdgeGlow } from './ui/EdgeGlow';
import {
  PlusIcon,
  LandmarkIcon,
  TrendingUpIcon,
  LayersIcon,
  SparklesIcon,
  PercentIcon,
  WalletIcon,
  RepeatIcon,
  MenuIcon,
} from './ui/Icons';
import { formatCurrency, formatPercent } from '../utils/finance';

export const CalculadoraApp: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'accounts'>('analysis');
  const [selectedHorizonId, setSelectedHorizonId] = useState<string>('1m');
  const [customYears, setCustomYears] = useState<number>(1);

  // Hook de minimizado reactivo de scroll
  const { scrollY, scrollProgress, isScrolled } = useScrollProgress(120);

  // Estado continuo de progreso (0 = Análisis, 1 = Cuentas) y soporte de arrastre (drag)
  const [tabProgress, setTabProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Referencias para interacción gestual horizontal continua
  const trackRef = useRef<HTMLElement>(null);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartProgressRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const isHorizontalDragRef = useRef<boolean>(false);

  // Modales
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [entityModalOpen, setEntityModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  const [apartadoModalOpen, setApartadoModalOpen] = useState(false);
  const [targetEntityIdForApartado, setTargetEntityIdForApartado] = useState<string | null>(null);
  const [editingApartado, setEditingApartado] = useState<Apartado | null>(null);

  const [selectedInstitutionDetailId, setSelectedInstitutionDetailId] = useState<string | null>(null);

  const handleTabChange = (targetTab: 'analysis' | 'accounts') => {
    setActiveTab(targetTab);
    setIsDragging(false);
    setTabProgress(targetTab === 'accounts' ? 1 : 0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, select, textarea, button, a, [role="button"], [role="slider"], svg')) {
      return;
    }

    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartProgressRef.current = tabProgress;
    isPointerDownRef.current = true;
    isHorizontalDragRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;

    if (!isHorizontalDragRef.current) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        isPointerDownRef.current = false;
        return;
      }
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        isHorizontalDragRef.current = true;
        setIsDragging(true);
      }
    }

    if (isHorizontalDragRef.current) {
      const containerWidth = trackRef.current?.offsetWidth || window.innerWidth || 800;
      const deltaProgress = -dx / containerWidth;
      const newProgress = Math.max(0, Math.min(1, dragStartProgressRef.current + deltaProgress));
      setTabProgress(newProgress);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;

    if (isHorizontalDragRef.current) {
      const initial = dragStartProgressRef.current;
      let finalTab: 'analysis' | 'accounts';

      if (initial === 0) {
        finalTab = tabProgress > 0.22 ? 'accounts' : 'analysis';
      } else {
        finalTab = tabProgress < 0.78 ? 'analysis' : 'accounts';
      }

      handleTabChange(finalTab);
    } else {
      // Si no fue arrastre horizontal completado, asegurar posición exacta de la pestaña activa
      setTabProgress(activeTab === 'accounts' ? 1 : 0);
    }

    isPointerDownRef.current = false;
    isHorizontalDragRef.current = false;
    setIsDragging(false);
  };

  // Listener global para asegurar que al soltar el puntero nunca se quede a la mitad
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPointerDownRef.current) {
        handlePointerUp();
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [activeTab, tabProgress]);

  // Inicialización de tema y datos
  useEffect(() => {
    // Cargar datos
    const loaded = loadPortfolioFromStorage();
    setEntities(loaded);
    setIsInitialized(true);

    // Forzar siempre modo oscuro permanente
    document.documentElement.classList.add('dark');
    try {
      localStorage.setItem('theme', 'dark');
    } catch (e) {}
  }, []);

  // Guardar en localStorage cuando cambian las entidades
  useEffect(() => {
    if (isInitialized) {
      savePortfolioToStorage(entities);
    }
  }, [entities, isInitialized]);

  // Cálculo consolidado memoizado
  const summary = useMemo(() => calculatePortfolioSummary(entities), [entities]);

  // Handlers para Entidades
  const handleOpenNewEntity = () => {
    setEditingEntity(null);
    setEntityModalOpen(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setEntityModalOpen(true);
  };

  const handleSaveEntity = (name: string, color: string) => {
    if (editingEntity) {
      // Actualizar existente
      setEntities((prev) =>
        prev.map((e) => (e.id === editingEntity.id ? { ...e, name, color } : e))
      );
    } else {
      // Crear nueva
      const newEntity: Entity = {
        id: `ent-${Date.now()}`,
        name,
        color,
        apartados: [],
      };
      setEntities((prev) => [...prev, newEntity]);
    }
  };

  const handleDeleteEntity = (entityId: string) => {
    if (window.confirm('¿Seguro que deseas eliminar esta entidad y todos sus apartados?')) {
      setEntities((prev) => prev.filter((e) => e.id !== entityId));
    }
  };

  const handleDuplicateEntity = (entity: Entity) => {
    const duplicated: Entity = {
      ...entity,
      id: `ent-${Date.now()}`,
      name: `${entity.name} (Copia)`,
      apartados: entity.apartados.map((apt) => ({
        ...apt,
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
    };
    setEntities((prev) => [...prev, duplicated]);
  };

  // Handlers para Apartados
  const handleOpenNewApartado = (entityId: string) => {
    setTargetEntityIdForApartado(entityId);
    setEditingApartado(null);
    setApartadoModalOpen(true);
  };

  const handleEditApartado = (entityId: string, apartado: Apartado) => {
    setTargetEntityIdForApartado(entityId);
    setEditingApartado(apartado);
    setApartadoModalOpen(true);
  };

  const handleSaveApartado = (apartado: Apartado) => {
    if (!targetEntityIdForApartado) return;

    setEntities((prev) =>
      prev.map((e) => {
        if (e.id !== targetEntityIdForApartado) return e;

        const exists = e.apartados.some((a) => a.id === apartado.id);
        const updatedApartados = exists
          ? e.apartados.map((a) => (a.id === apartado.id ? apartado : a))
          : [...e.apartados, apartado];

        return { ...e, apartados: updatedApartados };
      })
    );
  };

  const handleDeleteApartado = (entityId: string, apartadoId: string) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          apartados: e.apartados.filter((a) => a.id !== apartadoId),
        };
      })
    );
  };

  const handleDuplicateApartado = (entityId: string, apartado: Apartado) => {
    const duplicated: Apartado = {
      ...apartado,
      id: `apt-${Date.now()}`,
      name: `${apartado.name} (Copia)`,
    };
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          apartados: [...e.apartados, duplicated],
        };
      })
    );
  };

  // Toggle Activo/Inactivo (Simulaciones de escenario sin borrar)
  const handleToggleEntityActive = (entityId: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === entityId ? { ...e, isActive: e.isActive === false ? true : false } : e
      )
    );
  };

  const handleToggleApartadoActive = (entityId: string, apartadoId: string) => {
    setEntities((prev) =>
      prev.map((e) => {
        if (e.id !== entityId) return e;
        return {
          ...e,
          apartados: e.apartados.map((a) =>
            a.id === apartadoId ? { ...a, isActive: a.isActive === false ? true : false } : a
          ),
        };
      })
    );
  };

  // Restablecer / Borrar
  const handleReset = () => {
    const def = resetPortfolioToDefault();
    setEntities(def);
  };

  const handleClear = () => {
    const empty = clearPortfolioData();
    setEntities(empty);
  };

  const handleImport = (imported: Entity[]) => {
    setEntities(imported);
    savePortfolioToStorage(imported);
  };

  const targetEntityName = entities.find((e) => e.id === targetEntityIdForApartado)?.name || 'Entidad';

  // Transformaciones agresivas de apilamiento, desenfoque (blur) y minimización líquida 3D
  // Panel 1 (Análisis): Activo en tabProgress=0. Se minimiza, desenfoca y apila hacia el fondo al ir hacia 1
  const p1Scale = 1 - tabProgress * 0.16;
  const p1Blur = tabProgress * 12;
  const p1Opacity = Math.max(0.04, 1 - tabProgress * 0.92);
  const p1Y = tabProgress * 32;
  const p1Rotate = -tabProgress * 3;

  // Panel 2 (Cuentas): Minimizado, desenfocado y apilado en tabProgress=0. Emerge nítido y se expande en 1
  const p2Scale = 0.84 + tabProgress * 0.16;
  const p2Blur = (1 - tabProgress) * 12;
  const p2Opacity = Math.max(0.04, 0.04 + tabProgress * 0.96);
  const p2Y = (1 - tabProgress) * 32;
  const p2Rotate = (1 - tabProgress) * 3;

  return (
    <div className="relative min-h-screen pb-16">
      {/* Ambient Fluid Glowing Orbs (Liquid Glass effect) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/15 dark:bg-indigo-600/20 blur-[120px] animate-liquid-1" />
        <div className="absolute top-1/3 right-10 w-[600px] h-[600px] rounded-full bg-purple-500/15 dark:bg-purple-600/15 blur-[140px] animate-liquid-2" />
        <div className="absolute bottom-20 left-10 w-[550px] h-[550px] rounded-full bg-emerald-500/15 dark:bg-teal-500/15 blur-[130px] animate-liquid-3" />
      </div>

      {/* Cabecera estándar transparente con título a la izquierda y Conocer más a la derecha */}
      <Navbar onOpenAbout={() => setAboutModalOpen(true)} />

      {/* Cápsula de control: En móvil flota en la parte inferior junto al botón de hamburguesa; en PC flota solo en la parte superior */}
      <div className="fixed bottom-4 sm:bottom-auto sm:top-4 left-1/2 -translate-x-1/2 z-40 select-none flex items-center gap-2 sm:gap-3 transition-all duration-300 max-w-[calc(100vw-24px)]">
        {/* Slider de cambio entre Análisis y Cuentas */}
        <nav
          aria-label="Navegación principal de vistas"
          className="relative overflow-hidden liquid-glass rounded-full p-1 shadow-2xl shadow-indigo-950/20 dark:shadow-black/60 border border-white/90 dark:border-white/15 backdrop-blur-2xl bg-white/90 dark:bg-zinc-900/90 flex items-center w-[220px] sm:w-[260px] select-none shrink-0"
        >
          <EdgeGlow color="rgba(255, 255, 255, 0.85)" proximity={260} size={360} borderWidth={2} />

          {/* Pastilla flotante con resplandor que se desplaza continuamente */}
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30 pointer-events-none ${
              isDragging ? '' : 'transition-transform duration-300 ease-out'
            }`}
            style={{
              transform: `translate3d(${tabProgress * 100}%, 0, 0)`,
            }}
          />

          {/* Botón Análisis */}
          <button
            type="button"
            onClick={() => handleTabChange('analysis')}
            className={`relative z-10 w-1/2 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              tabProgress < 0.5 ? 'text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUpIcon size={14} />
            <span>Análisis</span>
            <span
              className={`w-1.5 h-1.5 rounded-full bg-cyan-300 transition-opacity duration-200 ${
                tabProgress < 0.3 ? 'opacity-100 animate-pulse' : 'opacity-0'
              }`}
            />
          </button>

          {/* Botón Cuentas */}
          <button
            type="button"
            onClick={() => handleTabChange('accounts')}
            className={`relative z-10 w-1/2 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              tabProgress >= 0.5 ? 'text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LandmarkIcon size={14} />
            <span>Cuentas</span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full transition-colors duration-200 ${
                tabProgress >= 0.5
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {entities.length}
            </span>
          </button>
        </nav>

        {/* Botón de hamburguesa: Flota junto al slider ÚNICAMENTE en versión móvil en la parte inferior */}
        <button
          type="button"
          onClick={() => setAboutModalOpen(true)}
          title="Abrir menú y centro de información"
          className="sm:hidden relative overflow-hidden p-2.5 rounded-full text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 liquid-glass border border-white/90 dark:border-white/15 backdrop-blur-2xl bg-white/90 dark:bg-zinc-900/90 shadow-2xl shadow-indigo-950/20 dark:shadow-black/60 transition-all flex items-center justify-center cursor-pointer hover:scale-105 shrink-0"
        >
          <EdgeGlow color="rgba(255, 255, 255, 0.85)" proximity={180} size={220} borderWidth={1.5} />
          <MenuIcon size={16} />
        </button>
      </div>

      <main
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="max-w-7xl mx-auto px-2 sm:px-4 pb-32 overflow-hidden touch-pan-y"
      >
        {/* Carrusel continuo con animación horizontal fluida y arrastre táctil/puntero */}
        <div
          className={`flex w-[200%] items-start ${
            isDragging ? '' : 'transition-transform duration-420 cubic-bezier(0.16, 1, 0.3, 1)'
          }`}
          style={{
            transform: `translate3d(-${tabProgress * 50}%, 0, 0)`,
          }}
        >
          {/* Panel 1: Análisis con minimización agresiva, apilamiento 3D y desenfoque líquido */}
          <div
            className="w-1/2 px-1 sm:px-2 space-y-8"
            style={{
              transform: `perspective(1200px) translate3d(0, ${p1Y}px, -${tabProgress * 90}px) scale(${p1Scale}) rotateX(${p1Rotate}deg)`,
              filter: p1Blur > 0.1 ? `blur(${p1Blur}px)` : 'none',
              opacity: p1Opacity,
              transformOrigin: 'top center',
              pointerEvents: tabProgress > 0.85 ? 'none' : 'auto',
              transition: isDragging
                ? 'none'
                : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), filter 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-hidden={tabProgress > 0.75}
          >
            {/* KPI Summary Cards con luz dinámica y foco central */}
            <FocalContainer>
              <KpiCards
                summary={summary}
                entities={entities}
                selectedHorizonId={selectedHorizonId}
                onSelectHorizon={setSelectedHorizonId}
                customYears={customYears}
                onCustomYearsChange={setCustomYears}
                scrollProgress={scrollProgress}
              />
            </FocalContainer>

            {/* Projection Chart con luz dinámica y foco central */}
            <FocalContainer>
              <ChartProjection
                entities={entities}
                selectedHorizonId={selectedHorizonId}
                onSelectHorizon={setSelectedHorizonId}
                customYears={customYears}
                onCustomYearsChange={setCustomYears}
              />
            </FocalContainer>

            {/* Tarjetas de Rendimiento por Institución con luz dinámica y foco central */}
            <FocalContainer>
              <InstitutionYieldCards
                entities={entities}
                summary={summary}
                selectedHorizonId={selectedHorizonId}
                onNavigateToAccounts={() => handleTabChange('accounts')}
                onSelectInstitution={setSelectedInstitutionDetailId}
              />
            </FocalContainer>
          </div>

          {/* Panel 2: Cuentas con emersión nítida, escala líquida y profundidad 3D (Sin desenfoque) */}
          <div
            className="w-1/2 px-1 sm:px-2 space-y-6"
            style={{
              transform: `perspective(1200px) translate3d(0, ${p2Y}px, -${(1 - tabProgress) * 90}px) scale(${p2Scale}) rotateX(${p2Rotate}deg)`,
              filter: 'none',
              opacity: p2Opacity,
              transformOrigin: 'top center',
              pointerEvents: tabProgress < 0.15 ? 'none' : 'auto',
              transition: isDragging
                ? 'none'
                : 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-hidden={tabProgress < 0.25}
          >
            <section aria-labelledby="entities-title" className="space-y-6">
              {/* Header de Cuentas: Descripción de instituciones y botón Nueva Entidad */}
              <div className="relative overflow-hidden liquid-glass rounded-3xl p-5 sm:p-6 border border-white/80 dark:border-white/10 shadow-lg">
                {/* Brillo suave en las orillas que sigue al scroll o cursor */}
                <EdgeGlow color="rgba(255, 255, 255, 0.75)" proximity={340} size={640} borderWidth={2.5} />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <LandmarkIcon size={18} />
                      </div>
                      <h2
                        id="entities-title"
                        className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                      >
                        Mis Entidades e Instrumentos Financieros
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      Puedes registrar cualquier tipo de institución: <strong>bancos tradicionales, SOFIPOs, fintechs, pagarés bancarios o fondos de inversión</strong>. No es necesario colocar su nombre real; puedes utilizar apodos, alias o nombres de tus metas personales.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      onClick={handleOpenNewEntity}
                      className="relative overflow-hidden px-4 py-2.5 rounded-2xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <EdgeGlow color="rgba(255, 255, 255, 0.85)" proximity={200} size={280} />
                      <PlusIcon size={15} />
                      <span>Nueva Entidad</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Listado de Entidades */}
              {entities.length === 0 ? (
                <div className="liquid-glass rounded-3xl p-12 text-center border-dashed">
                  <LandmarkIcon size={36} className="mx-auto text-zinc-400 mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    No tienes ninguna entidad registrada
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-5">
                    Crea tu primera entidad para comenzar a ingresar apartados de inversión, o restablece los valores didácticos de ejemplo.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-2xl text-xs font-semibold liquid-glass-subtle text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
                    >
                      Cargar Datos de Ejemplo
                    </button>
                    <button
                      onClick={handleOpenNewEntity}
                      className="px-4 py-2 rounded-2xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer"
                    >
                      Crear Entidad
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {entities.map((entity) => {
                    const entityCalc = summary.entitiesCalculations.find(
                      (c) => c.entityId === entity.id
                    );
                    if (!entityCalc) return null;

                    return (
                      <FocalContainer key={entity.id}>
                        <EntityCard
                          entity={entity}
                          calculation={entityCalc}
                          onEditEntity={handleEditEntity}
                          onDeleteEntity={handleDeleteEntity}
                          onDuplicateEntity={handleDuplicateEntity}
                          onAddApartado={handleOpenNewApartado}
                          onEditApartado={handleEditApartado}
                          onDeleteApartado={handleDeleteApartado}
                          onDuplicateApartado={handleDuplicateApartado}
                          onToggleEntityActive={handleToggleEntityActive}
                          onToggleApartadoActive={handleToggleApartadoActive}
                        />
                      </FocalContainer>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EntityModal
        isOpen={entityModalOpen}
        onClose={() => setEntityModalOpen(false)}
        onSave={handleSaveEntity}
        initialEntity={editingEntity}
      />

      <ApartadoModal
        isOpen={apartadoModalOpen}
        onClose={() => setApartadoModalOpen(false)}
        onSave={handleSaveApartado}
        initialApartado={editingApartado}
        entityName={targetEntityName}
      />

      {/* About, Knowledge Guide & Data Backup Drawer/Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        entities={entities}
        onImport={handleImport}
        onReset={handleReset}
        onClear={handleClear}
      />

      {/* Ventana Flotante de Detalles por Institución */}
      <InstitutionDetailModal
        isOpen={selectedInstitutionDetailId !== null}
        onClose={() => setSelectedInstitutionDetailId(null)}
        entity={entities.find((e) => e.id === selectedInstitutionDetailId) || null}
        calculation={summary.entitiesCalculations.find((c) => c.entityId === selectedInstitutionDetailId) || null}
        onNavigateToAccounts={() => {
          setSelectedInstitutionDetailId(null);
          handleTabChange('accounts');
        }}
      />
    </div>
  );
};
