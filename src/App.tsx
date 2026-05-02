import React from 'react';
import { useAppStore } from './store/appStore';
import ResourcesMenu from './components/ResourcesMenu';
import BadgePopup from './components/BadgePopup';
import CompletionScreen from './components/CompletionScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, CheckCircle2, Star, Zap, Target, LifeBuoy } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import TroubleshootingModal from './components/TroubleshootingModal';

// Placeholder components for the 6 steps
import AssemblyMinigame from './components/AssemblyMinigame';
import FluiddUIMinigame from './components/FluiddUIMinigame';
import BedLevelingMinigame from './components/BedLevelingMinigame';
import FilamentLoadMinigame from './components/FilamentLoadMinigame';
import SlicerMinigame from './components/SlicerMinigame';
import FirstPrintMinigame from './components/FirstPrintMinigame';
import HarvestMinigame from './components/HarvestMinigame';

const STEPS = [
  { id: 1, title: 'Összeszerelés & Csatlakozás', component: AssemblyMinigame },
  { id: 2, title: 'Fluidd UI Felfedezése', component: FluiddUIMinigame },
  { id: 3, title: 'Hibrid Asztalszintezés', component: BedLevelingMinigame },
  { id: 4, title: 'Filament Betöltés', component: FilamentLoadMinigame },
  { id: 5, title: 'Szeletelés (G-Code)', component: SlicerMinigame },
  { id: 6, title: 'Első Nyomtatás', component: FirstPrintMinigame },
  { id: 7, title: 'Levétel & Biztonság', component: HarvestMinigame },
];

function App() {
  const { currentStep, completedSteps, goToStep, nextStep, prevStep, totalScore, xp, level, getModuleStars } = useAppStore();
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = React.useState(false);

  const CurrentComponent = STEPS[currentStep - 1]?.component || AssemblyMinigame;
  const allCompleted = currentStep === 8;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <Printer className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight">Neptune 4 Max</h1>
              <div className="text-[10px] sm:text-xs font-bold text-teal-600 uppercase tracking-widest">Mesterkurzus</div>
            </div>
          </div>

          {/* ===== GAMIFICATION: Score & XP Display ===== */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Score */}
            <motion.div
              key={totalScore}
              initial={{ scale: 1.2, color: '#ef4444' }}
              animate={{ scale: 1, color: '#334155' }}
              className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <Target className="w-4 h-4 text-blue-500" />
              <span className="font-mono font-bold text-sm">{totalScore}</span>
            </motion.div>

            {/* XP + Level */}
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="font-mono font-bold text-sm text-purple-700">{xp} XP</span>
              <span className="text-[10px] font-bold text-purple-400 uppercase ml-1">{level}</span>
            </div>

            {/* Global Troubleshooting Button */}
            <button
              onClick={() => setIsTroubleshootingOpen(true)}
              className="ml-2 flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg border border-red-200 font-bold transition-colors shadow-sm"
            >
              <LifeBuoy className="w-4 h-4" />
              <span className="text-sm">Hibaelhárítás</span>
            </button>
          </div>

          {/* ===== NAVIGATION: Steps with Stars ===== */}
          <div className="hidden lg:flex gap-1.5">
            {STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;
              const stars = getModuleStars(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={!isCompleted && step.id > currentStep}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all 
                    ${isActive ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-400 hover:bg-slate-50'}
                    ${!isCompleted && step.id > currentStep ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
                    ${isCompleted ? 'bg-teal-500 text-white' : isActive ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                  </div>
                  {/* Star rating below completed modules */}
                  {isCompleted && stars > 0 ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(s => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase font-semibold text-center whitespace-nowrap max-w-[70px] truncate">
                      {step.title}
                    </span>
                  )}
                </button>
              )
            })}
            
            {allCompleted && (
              <button
                  onClick={() => goToStep(8)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all 
                    ${currentStep === 8 ? 'bg-teal-50 text-teal-700 shadow-sm border border-teal-100' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
                    ${currentStep === 8 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                    🏆
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-center whitespace-nowrap max-w-[70px] truncate">Eredmény</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Score Bar */}
        <div className="sm:hidden flex items-center justify-center gap-4 px-4 pb-3">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-xs sm:text-sm font-bold text-slate-400">Haladás</div>
              <div className="text-sm sm:text-base font-black text-slate-800">{currentStep} / {STEPS.length}</div>
            </div>
            {/* Simple Mobile Progress Bar */}
            <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <motion.div 
                className="h-full bg-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(currentStep, STEPS.length) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {currentStep === 8 ? (
          /* ===== COMPLETION SCREEN ===== */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CompletionScreen />
          </motion.div>
        ) : (
          <>
            <div className="mb-6 sm:mb-10 text-center">
              <span className="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-800 text-[10px] sm:text-sm font-semibold mb-2 sm:mb-3 tracking-wide uppercase">
                {currentStep}. Modul
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {STEPS[currentStep - 1]?.title}
              </h2>
            </div>

            <div className="w-full relative">
              <ErrorBoundary>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrentComponent />
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </div>

            <div className="mt-8 flex justify-between items-center max-w-2xl mx-auto">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 rounded-xl text-slate-600 hover:bg-slate-200 disabled:opacity-50 font-medium transition-colors"
              >
                Előző
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === 8 || !completedSteps.includes(currentStep)}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl shadow-md disabled:opacity-50 disabled:hover:bg-teal-500 font-semibold transition-colors"
              >
                Következő Modul
              </button>
            </div>
          </>
        )}
      </main>

      <TroubleshootingModal isOpen={isTroubleshootingOpen} onClose={() => setIsTroubleshootingOpen(false)} />
      <BadgePopup />
      <ResourcesMenu />
    </div>
  );
}

export default App;
