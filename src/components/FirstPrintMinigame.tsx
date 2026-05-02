import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Play, AlertTriangle, MoveDown, MoveUp, CheckCircle, Usb, Wifi, FileCode, X } from 'lucide-react';
import Confetti from 'react-confetti';

export default function FirstPrintMinigame() {
    const { completeCurrentStep, addFailure } = useAppStore();

    const [isPrinting, setIsPrinting] = useState(false);
    const [printProgress, setPrintProgress] = useState(0); // 0 to 100
    const [needBabyStep, setNeedBabyStep] = useState(false);
    const [babyStepValue, setBabyStepValue] = useState(0.15); // Started too high
    const [isDone, setIsDone] = useState(false);

    const [printMethod, setPrintMethod] = useState<'none' | 'usb' | 'fluidd'>('none');
    const [fluiddPhase, setFluiddPhase] = useState<'idle' | 'uploaded'>('idle');
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const handleGcodeDragEnd = (_e: any, info: any) => {
        const { offset } = info;
        // Drag towards the drop zone (top right area)
        if (offset.x > 100 && offset.y < -100) {
            setFluiddPhase('uploaded');
        } else {
            addFailure();
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPrinting && !isDone) {
            interval = setInterval(() => {
                setPrintProgress((prev) => {
                    // If we reach 15% and haven't baby-stepped yet, pause and alert
                    if (prev >= 15 && babyStepValue > 0.05) {
                        setNeedBabyStep(true);
                        // No addFailure() here - baby stepping is a standard procedure
                        return prev; 
                    }

                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsDone(true);
                        completeCurrentStep();
                        return 100;
                    }
                    return prev + 1;
                });
            }, needBabyStep ? 10000 : 100); // Super slow if needing baby step, fast otherwise
        }
        return () => clearInterval(interval);
    }, [isPrinting, isDone, needBabyStep, babyStepValue, addFailure, completeCurrentStep]);

    const handleStartPrint = () => {
        setIsPrinting(true);
    };

    const handleBabyStep = (direction: 'up' | 'down') => {
        setBabyStepValue(prev => {
            const newVal = direction === 'up' ? prev + 0.05 : prev - 0.05;

            // If we reach ideal Z (-0.00 to 0.05 relative), fix the issue
            if (newVal <= 0.05) {
                setNeedBabyStep(false);
            } else if (newVal > 0.1) {
                setNeedBabyStep(true);
            }

            return newVal;
        });
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row relative min-h-[600px] lg:min-h-[500px]">
            {isDone && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}

            {/* Left Column - Visuals & Feedback */}
            <div className="w-full md:w-1/2 bg-slate-900 relative flex border-r border-slate-200/20 overflow-hidden min-h-[300px]">
                <AnimatePresence mode="wait">
                    {!isPrinting && !isDone && (
                        printMethod === 'fluidd' ? (
                            <motion.div key="fluidd-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                                <img src="/images/modul2_fluidd_macros.png" alt="Fluidd Interface" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/1e293b/94a3b8?text=FOTO:+Fluidd+UI' }} />
                                <div className="absolute inset-0 bg-slate-900/60" />
                                
                                {fluiddPhase === 'idle' ? (
                                    <>
                                        {/* Dropzone */}
                                        <div 
                                            ref={dropZoneRef}
                                            className="absolute top-[10%] right-[5%] w-[45%] h-[50%] border-4 border-dashed border-blue-400 rounded-xl bg-blue-400/20 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm"
                                        >
                                            <span className="text-white font-bold drop-shadow-md text-lg">G-CODE Célterület (Jobs)</span>
                                            <span className="text-white/80 text-sm mt-2">Húzd ide a fájlt!</span>
                                        </div>

                                        {/* Draggable File */}
                                        <motion.div
                                            drag
                                            dragConstraints={{ left: -100, right: 300, top: -300, bottom: 100 }}
                                            dragSnapToOrigin={true}
                                            onDragEnd={handleGcodeDragEnd}
                                            className="absolute bottom-[10%] left-[10%] w-24 h-28 bg-white rounded-lg shadow-2xl border-2 border-slate-300 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                        >
                                            <FileCode className="w-10 h-10 text-blue-500 mb-2" />
                                            <span className="text-xs font-bold text-slate-700 truncate w-full text-center px-2">benchy.gcode</span>
                                        </motion.div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="bg-emerald-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center gap-3 text-xl">
                                            <CheckCircle className="w-8 h-8" /> Fájl feltöltve a Fluidd-re!
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                                <img src="/images/modul_main_menu.jpg" alt="Nyomtató kijelző - Print menüpont" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/1e293b/94a3b8?text=CÉL:+Nyomtatás+Indítása' }} />
                                <div className="absolute inset-0 bg-slate-900/30" />
                                <div className="relative z-10 mt-auto p-6 w-full">
                                    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-2xl text-center">
                                        <h3 className="text-lg font-bold text-slate-200">Nyomtatás indítása</h3>
                                        <p className="text-sm text-slate-400 mt-1">Válaszd ki a jobb oldalon, hogyan szeretnéd indítani a nyomtatást!</p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    )}

                    {isPrinting && needBabyStep && (
                        <motion.div key="error" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                            <img src="/images/modul6_tul_magas.jpg" alt="Túl magasan van a fúvóka" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/ef4444/fee2e2?text=FOTO:+Túl+magasan+van+a+fúvóka' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                            <div className="relative z-10 mt-auto p-6 w-full">
                                <div className="bg-red-900/90 backdrop-blur-md rounded-2xl p-5 border border-red-500/50 flex items-start gap-4 shadow-2xl transform translate-y-2">
                                    <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-red-50 text-lg mb-1">A réteg nem tapad!</h4>
                                        <p className="text-sm text-red-200 leading-relaxed">A fúvóka túl messze van az asztaltól. A filament csak a levegőben hullik. Azonnal avatkozz be!</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isPrinting && !needBabyStep && !isDone && (
                        <motion.div key="printing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                            <img src="/images/modul6_tokeletes.jpg" alt="Tökéletes első réteg készül" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/3b82f6/eff6ff?text=FOTO:+Készülő+tökéletes+réteg' }} />
                            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" />

                            <div className="relative z-10 mt-auto p-6 w-full">
                                <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-slate-200">Nyomtatás folyamatban...</h4>
                                        <span className="font-mono font-bold text-blue-400">{printProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <motion.div className="h-full bg-blue-500" animate={{ width: `${printProgress}%` }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isDone && (
                        <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center">
                            <img src="/images/modul6_tokeletes.jpg" alt="Tökéletes nyomtatás" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/10b981/ecfdf5?text=FOTO:+Befejezett+Hibátlan+Nyomat' }} />
                            <div className="absolute inset-0 bg-emerald-900/60 mix-blend-multiply" />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                className="relative z-10 bg-emerald-900/80 backdrop-blur-md border border-emerald-500/30 p-8 rounded-3xl text-center shadow-2xl m-6"
                            >
                                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-emerald-50 mb-2">Tökéletes lett!</h3>
                                <p className="text-emerald-200 text-sm">A Baby-stepping-nek köszönhetően megmentetted a nyomtatást.</p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column - Controls */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 sm:p-10 flex flex-col justify-center hide-scrollbar overflow-y-auto">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">Első Nyomtatás & Baby-stepping</h2>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                        A nyomtatás elindul, de az első réteget <strong>mindig</strong> figyelni kell! Ha nem tapad eléggé, menet közben kell korrigálni a Z-tengely magasságát (Baby-stepping).
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-3">
                        <p className="text-sm text-red-800 font-medium">
                            <AlertTriangle className="w-4 h-4 inline mr-1 -mt-0.5" />
                            ⚠️ <strong>ÉGÉSVESZÉLY!</strong> Nyomtatás közben az asztal (<strong>60°C</strong>) és a fúvóka (<strong>200°C+</strong>) rendkívül forró. <strong>Ne nyúlj</strong> a mozgó alkatrészekhez és a fűtött felületekhez!
                        </p>
                    </div>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-3">
                        <p className="text-sm text-amber-800 font-medium">
                            <AlertTriangle className="w-4 h-4 inline mr-1 -mt-0.5" />
                            Fontos: A nyomtatás közbeni Z-offset módosítás kikapcsoláskor elveszhet! A végleges értéket érdemes a „Level" menüben elmenteni.
                        </p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                        <p className="text-sm text-blue-800 font-medium">
                            ℹ️ A Baby-stepping / Z-offset állítása nyomtatás közben az <strong>"Adjust"</strong> menüben érhető el. Egyes firmware verziókban ez <strong>"Tune"</strong> vagy <strong>"Settings"</strong> néven szerepelhet. Ha nem találod, kérdezd meg a laborvezetőt!
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {!isPrinting ? (
                        printMethod === 'none' ? (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 text-lg">Milyen módszerrel indítod a nyomtatást?</h3>
                                <button
                                    onClick={() => setPrintMethod('usb')}
                                    className="w-full py-5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-400 text-slate-700 rounded-2xl font-bold transition-all flex items-center gap-4 px-6 shadow-sm group"
                                >
                                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 rounded-xl flex items-center justify-center transition-colors">
                                        <Usb className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-base">USB Pendrive-ról</div>
                                        <div className="text-xs text-slate-400 font-normal">A nyomtató saját kijelzőjét használva.</div>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => setPrintMethod('fluidd')}
                                    className="w-full py-5 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-400 text-slate-700 rounded-2xl font-bold transition-all flex items-center gap-4 px-6 shadow-sm group"
                                >
                                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 text-slate-500 group-hover:text-teal-600 rounded-xl flex items-center justify-center transition-colors">
                                        <Wifi className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-base">Fluidd (Hálózat)</div>
                                        <div className="text-xs text-slate-400 font-normal">A webes felületen keresztül, távolról.</div>
                                    </div>
                                </button>
                            </div>
                        ) : printMethod === 'usb' ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 text-sm">
                                    Válaszd ki a fájlt a nyomtató kijelzőjén a "Print" menüpontban, majd indítsd el!
                                </div>
                                <button
                                    onClick={handleStartPrint}
                                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:shadow-[0_8px_40px_rgb(37,99,235,0.4)] transition-all flex justify-center items-center gap-3 transform hover:-translate-y-1"
                                >
                                    <Play className="w-6 h-6 fill-current" />
                                    Nyomtatás Indítása (USB)
                                </button>
                                <button onClick={() => setPrintMethod('none')} className="w-full text-center text-sm text-slate-500 hover:text-slate-700 font-bold">← Vissza</button>
                            </div>
                        ) : printMethod === 'fluidd' ? (
                            <div className="space-y-4">
                                {fluiddPhase === 'idle' ? (
                                    <div className="bg-teal-50 border border-teal-200 p-5 rounded-xl text-teal-800 text-sm shadow-sm flex flex-col gap-3">
                                        <div className="font-bold flex items-center gap-2">
                                            <FileCode className="w-5 h-5 text-teal-600" />
                                            Feltöltés szükséges!
                                        </div>
                                        <div>
                                            Fogd meg a bal oldali G-code fájlt, és <strong>húzd be</strong> a Fluidd felület megjelölt célterületére (Jobs menü)!
                                        </div>
                                        <button onClick={() => setPrintMethod('none')} className="w-full text-center text-sm text-slate-500 hover:text-slate-700 font-bold mt-2">← Vissza</button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleStartPrint}
                                            className="w-full py-6 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-xl shadow-[0_8px_30px_rgb(13,148,136,0.3)] hover:shadow-[0_8px_40px_rgb(13,148,136,0.4)] transition-all flex justify-center items-center gap-3 transform hover:-translate-y-1"
                                        >
                                            <Play className="w-6 h-6 fill-current" />
                                            Nyomtatás Indítása (Fluidd)
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : null
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {needBabyStep && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white border-2 border-red-200 rounded-3xl shadow-xl overflow-hidden flex flex-col"
                                    >
                                        <div className="h-32 bg-slate-100 relative overflow-hidden shrink-0 border-b border-red-50">
                                            <img src="/images/modul6_kijelzo_babystep.jpg" alt="Kijelző Baby-stepping" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x200/f8fafc/94a3b8?text=FOTO:+Kijelző+Z-Offset' }} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                                            <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                                <span className="font-bold text-red-600 text-sm tracking-wider uppercase">Beavatkozás Szükséges</span>
                                            </div>
                                        </div>

                                        <div className="p-6 relative z-10 bg-white">
                                            <p className="text-slate-600 text-sm mb-6 text-center">
                                                A "Adjust" menüben módosítsd a magasságot ("Z-offset"), amíg a réteg egyenletesen szét nem terül.
                                            </p>

                                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col items-center shadow-inner">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Z-Offset</span>
                                                <div className="text-4xl font-mono font-black text-slate-800 mb-6 bg-white px-8 py-3 rounded-xl border border-slate-200 shadow-sm">
                                                    {babyStepValue > 0 ? '+' : ''}{babyStepValue.toFixed(2)}
                                                </div>
                                                <div className="flex gap-4 w-full">
                                                    <button
                                                        onClick={() => handleBabyStep('up')}
                                                        className="flex-1 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold flex flex-col items-center transition-colors shadow-sm"
                                                    >
                                                        <MoveUp className="w-6 h-6 mb-2 text-slate-400" />
                                                        Fel (+ Z)
                                                    </button>
                                                    <button
                                                        onClick={() => handleBabyStep('down')}
                                                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex flex-col items-center transition-colors shadow-md transform hover:-translate-y-1"
                                                    >
                                                        <MoveDown className="w-6 h-6 mb-2 text-red-200" />
                                                        Le (- Z)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!needBabyStep && !isDone && (
                                <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl text-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                    <h3 className="font-bold text-blue-800 text-lg">A nyomtatás zavartalan...</h3>
                                    <p className="text-blue-600/70 text-sm">Figyeld az első réteget és hagyd dolgozni a gépet.</p>
                                </div>
                            )}

                            {isDone && (
                                <button
                                    className="w-full py-5 bg-emerald-100 text-emerald-700 rounded-xl font-bold flex justify-center items-center gap-2 border border-emerald-200"
                                    disabled
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Modul Teljesítve
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
