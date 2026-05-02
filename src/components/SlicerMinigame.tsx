import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Layers, Download, Play, CheckCircle2, ExternalLink, Globe, Save } from 'lucide-react';
import Confetti from 'react-confetti';

type SlicerPhase = 'printables' | 'slicer' | 'done';

export default function SlicerMinigame({ isOptional = false, onExit }: { isOptional?: boolean, onExit?: () => void }) {
    const { completeCurrentStep, nextStep } = useAppStore();

    const [phase, setPhase] = useState<SlicerPhase>('printables');
    const [hasModel, setHasModel] = useState(false);
    const [isSlicing, setIsSlicing] = useState(false);
    const [sliceProgress, setSliceProgress] = useState(0);
    const [isSliced, setIsSliced] = useState(false);
    const [isDone, setIsDone] = useState(false);

    // Fake drag drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setHasModel(true);
    };
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const startSlicing = () => {
        setIsSlicing(true);
        let current = 0;
        const interval = setInterval(() => {
            current += 2;
            setSliceProgress(current);
            if (current >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsSliced(true);
                    setIsSlicing(false);
                }, 500);
            }
        }, 50);
    };

    const handleSaveToDisk = () => {
        setIsDone(true);
        if (!isOptional) {
            completeCurrentStep();
            setTimeout(nextStep, 2000);
        } else if (onExit) {
            setTimeout(onExit, 2000);
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
            {isDone && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}

            <AnimatePresence mode="wait">

                {/* ===== PHASE 0: Printables & Cura Download Guide ===== */}
                {phase === 'printables' && (
                    <motion.div
                        key="printables"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 sm:p-10"
                    >
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                                <Globe className="w-8 h-8 text-orange-500" /> Előkészületek
                            </h2>
                            <p className="text-slate-500">
                                Mielőtt szeletelnénk, szükségünk van egy 3D modellre (.stl) és egy szeletelő szoftverre.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                            {/* LEFT: Printables image */}
                            <div className="w-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex flex-col">
                                <img
                                    src="/images/modul5_printables.png"
                                    alt="Printables.com - 3D modellek letöltése"
                                    className="w-full h-64 object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x500/1e293b/94a3b8?text=Printables.com' }}
                                />
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">1. 3D Modell Letöltése</h3>
                                    <p className="text-sm text-slate-500 mb-4 flex-1">
                                        A <strong>Printables.com</strong> oldalon rengeteg ingyenes, nyomtatásra kész .STL fájlt találsz. Keresd meg a kívánt modellt (pl. Benchy teszt hajó), töltsd le és mentsd el a gépedre.
                                    </p>
                                    <a
                                        href="https://www.printables.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold text-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Megnyitás: Printables.com
                                    </a>
                                </div>
                            </div>

                            {/* RIGHT: Cura download guide */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col shadow-sm">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                    <Layers className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">2. Szeletelő Szoftver Telepítése</h3>
                                <p className="text-sm text-slate-500 mb-4 flex-1">
                                    A szeletelő szoftver (.STL → .GCODE konvertáló) nélkülözhetetlen. Az <strong>UltiMaker Cura</strong> ingyenes, kezdőbarát, és a Neptune 4 Max profillal azonnal használható. Alternatíva: <strong>OrcaSlicer</strong>.
                                </p>
                                <div className="space-y-3">
                                    <a
                                        href="https://ultimaker.com/software/ultimaker-cura/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold transition-colors shadow-md"
                                    >
                                        <Download className="w-5 h-5" /> UltiMaker Cura Letöltése
                                    </a>
                                    <a
                                        href="https://github.com/SoftFever/OrcaSlicer/releases"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 py-3 px-6 rounded-xl font-bold transition-colors border border-slate-200"
                                    >
                                        <ExternalLink className="w-4 h-4" /> OrcaSlicer (alternatíva)
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 flex items-start gap-2 text-xs text-blue-800">
                            <span className="shrink-0 mt-0.5">ℹ️</span>
                            <span>A szeletelő szoftverek folyamatosan frissülnek – a <strong>felület kinézete és a gombok elhelyezkedése változhat</strong> újabb verziókban. Ha a képernyőd nem egyezik a bemutatóval, ne aggódj: a lépések logikája ugyanaz marad. Kérdezd meg a <strong>laborvezetőt</strong>, ha elakadnál!</span>
                        </div>

                        <button
                            onClick={() => setPhase('slicer')}
                            className="w-full mt-6 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-md transition-colors"
                        >
                            Megvan a modell és a szoftver, tovább a szeleteléshez →
                        </button>
                    </motion.div>
                )}

                {/* ===== PHASE 1: Slicer Simulator ===== */}
                {phase === 'slicer' && (
                    <motion.div
                        key="slicer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col md:flex-row min-h-[500px]"
                    >
                        {/* Slicer Sidebar (UI controls) */}
                        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-8 flex flex-col z-10 shadow-sm">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                                    <Layers className="w-8 h-8 text-blue-600" /> Slicer
                                </h2>
                                <p className="text-sm text-slate-500">
                                    A 3D modellt (.stl) először G-kódra kell fordítani, amit a nyomtató megért. (OrcaSlicer / Elegoo Cura)
                                </p>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className={`bg-white p-4 rounded-xl border transition-colors ${hasModel ? 'border-blue-200 shadow-sm' : 'border-slate-200 opacity-50'}`}>
                                    <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Layer Height</span>
                                    <div className={`text-lg font-mono font-semibold ${hasModel ? 'text-slate-700' : 'text-slate-400'}`}>0.20 mm</div>
                                </div>
                                <div className={`bg-white p-4 rounded-xl border transition-colors ${hasModel ? 'border-blue-200 shadow-sm' : 'border-slate-200 opacity-50'}`}>
                                    <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Infill Density</span>
                                    <div className={`text-lg font-mono font-semibold ${hasModel ? 'text-slate-700' : 'text-slate-400'}`}>15 %</div>
                                </div>
                                <div className={`bg-white p-4 rounded-xl border transition-colors ${hasModel ? 'border-blue-200 shadow-sm' : 'border-slate-200 opacity-50'}`}>
                                    <span className="text-xs uppercase tracking-widest font-bold text-slate-400">Support</span>
                                    <div className={`text-lg font-mono font-semibold ${hasModel ? 'text-slate-700' : 'text-slate-400'}`}>Normál</div>
                                </div>
                            </div>

                            {/* Step 1: Slice button */}
                            {!isSliced && (
                                <button
                                    onClick={startSlicing}
                                    disabled={!hasModel || isSlicing}
                                    className="w-full py-4 mt-8 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 text-white rounded-xl font-bold shadow-md uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    {isSlicing ? 'Szeletelés...' : 'Slice (G-Code Generálása)'}
                                </button>
                            )}

                            {/* Step 2: Save to Disk button (appears after slicing) */}
                            {isSliced && !isDone && (
                                <button
                                    onClick={handleSaveToDisk}
                                    className="w-full py-4 mt-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md uppercase tracking-wider transition-colors flex items-center justify-center gap-2 animate-pulse"
                                >
                                    <Save className="w-5 h-5" />
                                    Save to Disk (Mentés pendrive-ra)
                                </button>
                            )}

                            {/* Step 3: Done */}
                            {isDone && (
                                <button
                                    disabled
                                    className="w-full py-4 mt-8 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-emerald-200"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    KÉSZ – G-Code Elmentve!
                                </button>
                            )}
                        </div>

                        {/* Slicer Viewport */}
                        <div className="flex-1 bg-slate-100 relative min-h-[400px] flex items-center justify-center p-8 overflow-hidden z-0">

                            <AnimatePresence mode="wait">
                                {!hasModel && (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        className="relative z-10 border-4 border-dashed border-slate-400 rounded-3xl p-12 text-center max-w-sm bg-white/80 backdrop-blur-sm shadow-xl"
                                    >
                                        <Download className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-700 mb-2">Húzd ide a 3D modellt!</h3>
                                        <p className="text-slate-500 text-sm">Próbaképp egy Benchy hajót (.stl) töltünk be az asztalra.</p>

                                        <button
                                            onClick={() => setHasModel(true)}
                                            className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors w-full"
                                        >
                                            Vagy kattints az importáláshoz
                                        </button>
                                    </motion.div>
                                )}

                                {hasModel && (
                                    <motion.div
                                        key="model"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <img
                                            src="/images/modul5_slicer.png"
                                            alt="Slicer szoftver képernyőkép"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800/1e293b/94a3b8?text=FOTO:+Slicer+Kepernyokep' }}
                                        />

                                        {/* Overlay during slicing */}
                                        <AnimatePresence>
                                            {isSlicing && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
                                                >
                                                    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center">
                                                        <Layers className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-bounce" />
                                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Szeletelés folyamatban...</h3>
                                                        <p className="text-slate-500 text-sm mb-6">A modell rétegekre bontása és az útvonal kiszámítása.</p>

                                                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner border border-slate-200">
                                                            <motion.div
                                                                className="bg-blue-500 h-full"
                                                                animate={{ width: `${sliceProgress}%` }}
                                                            />
                                                        </div>
                                                        <div className="mt-3 font-mono font-bold text-blue-600">{sliceProgress}%</div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {isSliced && !isDone && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="bg-emerald-50 text-emerald-800 p-8 rounded-2xl shadow-2xl border-2 border-emerald-200 text-center max-w-sm"
                                                    >
                                                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                                        <h3 className="text-2xl font-bold mb-2">Sikeres szeletelés!</h3>
                                                        <p className="text-sm opacity-80 mb-6">Most mentsd el a G-Code fájlt egy pendrive-ra a bal oldali „Save to Disk" gombbal!</p>

                                                        <div className="bg-white px-4 py-3 rounded-xl border border-emerald-100 shadow-sm font-mono text-sm font-bold text-emerald-600 truncate flex items-center justify-center gap-2">
                                                            <Save className="w-4 h-4" />
                                                            Benchy_Nep4Max_1h12m.gcode
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {isDone && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-emerald-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-20"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm"
                                                    >
                                                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                                        <h3 className="text-2xl font-bold mb-2">G-Code Elmentve!</h3>
                                                        <p className="text-sm text-slate-500">A fájl a pendrive-on van. Dugd be a nyomtató USB portjába és indíts nyomtatást!</p>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
