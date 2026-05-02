import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Flame, Snowflake, PartyPopper } from 'lucide-react';
import Confetti from 'react-confetti';

export default function HarvestMinigame() {
    const { completeCurrentStep, addFailure, nextStep } = useAppStore();

    const [bedTemp, setBedTemp] = useState(60);
    const [isCooling, setIsCooling] = useState(false);
    const [canBend, setCanBend] = useState(false);
    const [hasHarvested, setHasHarvested] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [wipeCount, setWipeCount] = useState(0);
    const [isDone, setIsDone] = useState(false);

    // Framer Motion drag value for bending the plate
    const dragY = useMotionValue(0);
    // Transform drag Y distance into a bending rotation/scale effect
    const plateBend = useTransform(dragY, [0, -100], [0, 15]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isCooling && bedTemp > 35) {
            interval = setInterval(() => {
                setBedTemp(prev => {
                    const next = prev - 1;
                    if (next <= 40 && !canBend) {
                        setCanBend(true);
                    }
                    return next;
                });
            }, 150); // Fast simulation
        } else if (bedTemp <= 35) {
            setIsCooling(false);
        }
        return () => clearInterval(interval);
    }, [isCooling, bedTemp, canBend]);

    const handleDragEnd = () => {
        if (dragY.get() < -60) {
            if (canBend) {
                setHasHarvested(true);
            } else {
                addFailure(); // Tried to harvest while hot
            }
        }
    };

    const handleStartCleaning = () => {
        setIsCleaning(true);
    };

    const handleWipe = () => {
        if (wipeCount < 5) {
            setWipeCount(prev => prev + 1);
        } else if (wipeCount === 5) {
            setWipeCount(6);
            setTimeout(() => {
                if (!isDone) {
                    setIsDone(true);
                    completeCurrentStep();
                    setTimeout(() => nextStep(), 2500);
                }
            }, 500);
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row relative min-h-[600px] lg:min-h-[500px]">
            {isDone && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}

            {/* Left Column - Visuals */}
            <div className="w-full md:w-1/2 bg-slate-900 relative flex border-r border-slate-200/20 overflow-hidden min-h-[300px]">
                <AnimatePresence mode="wait">
                    {!canBend && !hasHarvested && (
                        <motion.div key="hot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                            <img src="/images/modul7_levetel_PEI.jpg" alt="Forró PEI lap" className="absolute inset-0 w-full h-full object-cover blur-sm mix-blend-luminosity opacity-40" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/1e293b/94a3b8?text=FOTO:+Forró+Tálca' }} />
                            <div className="absolute inset-0 bg-red-900/20" />
                            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                                <Flame className="w-20 h-20 text-red-500/50 mb-4 animate-pulse" />
                                <h3 className="text-2xl font-bold text-red-100">Forró! Tilos Hozzányúlni!</h3>
                                <p className="text-red-200/80 mt-2">Várd meg amíg biztonságos szobahőmérsékletre hűl.</p>
                            </div>
                        </motion.div>
                    )}

                    {canBend && !hasHarvested && (
                        <motion.div key="ready" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col">
                            <img src="/images/modul7_levetel_PEI.jpg" alt="Kihűlt PEI lap" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/3b82f6/eff6ff?text=FOTO:+PEI+lap+levétele' }} />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/80 to-transparent" />
                            <div className="relative z-10 mt-auto p-8 text-center w-full">
                                <div className="bg-blue-900/80 backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 inline-block shadow-2xl animate-bounce">
                                    <h4 className="font-bold text-blue-100">A széleinél fogva biztonságosan megfogható!</h4>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {hasHarvested && !isCleaning && (
                        <motion.div key="harvested" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col">
                            <img src="/images/modul7_meghajlitas_Benchy.jpg" alt="PEI lap meghajlítása" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/10b981/ecfdf5?text=FOTO:+Tárgy+leválása+a+PEI-ről' }} />
                            <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply" />
                            <div className="relative z-10 mt-auto p-8 w-full">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-emerald-900/90 backdrop-blur-md border border-emerald-500/50 p-6 rounded-2xl shadow-2xl"
                                >
                                    <h4 className="font-bold text-emerald-100 text-lg flex items-center gap-2">
                                        <PartyPopper className="w-5 h-5 text-emerald-400" />
                                        Tökéletes leválasztás!
                                    </h4>
                                    <p className="text-emerald-200/80 text-sm mt-1">
                                        A mágneses PEI lap meghajlításával a modell lepattant.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {isCleaning && (
                        <motion.div key="cleaning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col">
                            <img src="/images/modul7_ipa_cleaning.png" alt="IPA Tisztítás" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/334155/94a3b8?text=IPA+Cleaning' }} />
                            <div className="absolute inset-0 bg-blue-900/40" />
                            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
                                <motion.button
                                    whileTap={{ scale: 0.9, rotate: 5 }}
                                    onClick={handleWipe}
                                    className="w-32 h-32 bg-white/20 backdrop-blur-xl border-4 border-white rounded-full flex flex-col items-center justify-center text-white shadow-2xl group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-blue-500/30 group-hover:bg-blue-500/50 transition-colors" />
                                    <span className="relative font-bold text-lg">TÖRLÉS</span>
                                    <span className="relative text-[10px] mt-1">{wipeCount}/6</span>
                                </motion.button>
                                <p className="text-white font-bold mt-6 text-center drop-shadow-lg">Tisztítsd le az asztalt IPA-val!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column - Controls */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 sm:p-10 flex flex-col justify-center hide-scrollbar overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-3 flex items-center gap-3">
                        Levétel & Biztonság
                    </h2>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                        A nyomtatás véget ért, de még <strong>Tilos</strong> hozzányúlni a forró asztalhoz! Várd meg a lehűlést, majd a <strong>széleinél fogva</strong> emeld le a PEI lapot.
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-3">
                        <p className="text-sm text-red-800 font-medium text-center">
                            ⚠️ <strong>ÉGÉSVESZÉLY!</strong>
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-8">
                    {/* Temperature Indicator */}
                    <div className={`p-6 rounded-3xl border-2 transition-all duration-700 shadow-sm flex items-center gap-6 ${bedTemp > 40 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                        <div className={`p-4 rounded-2xl ${bedTemp > 40 ? 'bg-red-100/50 text-red-500' : 'bg-blue-100/50 text-blue-500'}`}>
                            {bedTemp > 40 ? <Flame className="w-8 h-8" /> : <Snowflake className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                            <div className="text-5xl font-mono font-black tracking-tighter text-center">
                                {bedTemp}°C
                            </div>
                        </div>

                        {!isCooling && bedTemp === 60 && (
                            <button
                                onClick={() => setIsCooling(true)}
                                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold"
                            >
                                Hűtés
                            </button>
                        )}
                    </div>

                    {/* Interactive Plate Bending */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
                        {!hasHarvested ? (
                            <>
                                <h3 className="font-bold text-slate-700 mb-6">PEI Lap Meghajlítása</h3>
                                <div className="h-32 flex items-center justify-center relative perspective-[800px]">
                                    <motion.div
                                        drag="y"
                                        dragConstraints={{ top: -60, bottom: 0 }}
                                        dragElastic={0.1}
                                        onDragEnd={handleDragEnd}
                                        style={{ y: dragY, rotateX: plateBend }}
                                        className={`w-48 h-12 rounded-lg flex items-center justify-center shadow-xl cursor-grab active:cursor-grabbing transition-colors ${canBend ? 'bg-yellow-400 border border-yellow-500' : 'bg-slate-300 border border-slate-400'}`}
                                    >
                                        <span className="font-bold text-black/50 select-none">PEI LAP</span>
                                    </motion.div>
                                </div>
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
                                <PartyPopper className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                                <h3 className="text-xl font-bold">Nyomat eltávolítva!</h3>
                            </motion.div>
                        )}

                        {hasHarvested && !isCleaning && (
                            <div className="mt-4">
                                <button
                                    onClick={handleStartCleaning}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg"
                                >
                                    Asztal letörlése (IPA)
                                </button>
                            </div>
                        )}

                        {isDone && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-slate-900 rounded-xl text-center text-white mt-4">
                                <h4 className="font-bold">Küldetés Teljesítve!</h4>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
