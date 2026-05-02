import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Flame, ScanLine, ArrowDownToLine, Check, AlertTriangle } from 'lucide-react';
import Confetti from 'react-confetti';

type LevelingPhase = 'preheat' | 'abl' | 'zoffset' | 'done';

export default function BedLevelingMinigame() {
    const { completeCurrentStep, addFailure } = useAppStore();

    const [phase, setPhase] = useState<LevelingPhase>('preheat');
    const [zOffset, setZOffset] = useState(-1.50); // Target: -2.35
    const [isDone, setIsDone] = useState(false);

    // Z-Offset
    // Perfect offset: -2.35. Less than -2.45 = scratch. More than -2.25 = loose.
    const handleSetZOffset = () => {
        if (zOffset > -2.45 && zOffset < -2.25) {
            setPhase('done');
            setIsDone(true);
            completeCurrentStep();
        } else {
            addFailure();
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-4 sm:p-10 relative">
            {isDone && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}

            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Szintezés és Z-Offset</h2>
                    <p className="text-slate-500 mt-2 max-w-lg">
                        Állítsuk be a tökéletes első réteghez szükséges alapokat az Automatikus Szintezéssel (ABL).
                    </p>
                </div>

                {/* Phase Timeline Indicator */}
                <div className="hidden sm:flex items-center gap-3 text-sm font-semibold">
                    <div className={`flex flex-col items-center gap-2 ${phase === 'preheat' ? 'text-orange-600' : 'text-slate-400'}`}>
                        <div className={`p-2 rounded-full ${phase === 'preheat' ? 'bg-orange-100' : 'bg-slate-100'}`}><Flame className="w-5 h-5" /></div>
                        Előfűtés
                    </div>
                    <div className="w-5 h-1 bg-slate-200 rounded-full" />
                    <div className={`flex flex-col items-center gap-2 ${phase === 'abl' ? 'text-teal-600' : 'text-slate-400'}`}>
                        <div className={`p-2 rounded-full ${phase === 'abl' ? 'bg-teal-100' : 'bg-slate-100'}`}><ScanLine className="w-5 h-5" /></div>
                        Auto Level
                    </div>
                    <div className="w-5 h-1 bg-slate-200 rounded-full" />
                    <div className={`flex flex-col items-center gap-2 ${phase === 'zoffset' || phase === 'done' ? 'text-purple-600' : 'text-slate-400'}`}>
                        <div className={`p-2 rounded-full ${phase === 'zoffset' || phase === 'done' ? 'bg-purple-100' : 'bg-slate-100'}`}><ArrowDownToLine className="w-5 h-5" /></div>
                        Z-Offset
                    </div>
                </div>
            </div>

            <div className="min-h-[400px] flex items-center justify-center">
                <AnimatePresence mode="wait">

                    {/* ===== PHASE 0: Pre-heat ===== */}
                    {phase === 'preheat' && (
                        <motion.div
                            key="preheat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
                        >
                            {/* LEFT: Image */}
                            <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                                <img
                                    src="/images/modul4_temp_menu.jpg"
                                    alt="Előmelegítés a Prepare menüben"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTO:+Temp+Menu' }}
                                />
                            </div>

                            {/* RIGHT: UI */}
                            <div className="bg-orange-50 border border-orange-200 p-8 rounded-2xl w-full text-center shadow-sm">
                                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Flame className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">0. Asztal Előmelegítése</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    <strong>FONTOS!</strong> Szintezés előtt az asztalt mindig elő kell melegíteni a nyomtatási hőmérsékletre (PLA: <strong>60°C</strong>). Ezt a kijelzőn a <strong>Prepare</strong> menüpont alatt találod meg!
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 flex items-start gap-2 text-left text-xs text-blue-800">
                                    <span className="shrink-0 mt-0.5">ℹ️</span>
                                    <span>A menürendszer a nyomtató <strong>firmware verziójától</strong> függően eltérhet. Ha nem találod a "Prepare" menüpontot, kérdezd meg a laborvezetőt!</span>
                                </div>

                                <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3 flex items-start gap-2 text-left text-xs text-red-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                                    <span>⚠️ <strong>ÉGÉSVESZÉLY!</strong> Az asztal felmelegítés után <strong>60°C</strong>-os lesz. <strong>Ne érintsd meg</strong> a fűtött felületet, mert égési sérülést okozhatsz! Csak a gép peremét fogd meg.</span>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-2 text-left text-xs text-amber-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                                    <span>Mielőtt elkezded, <strong>tisztítsd meg a fúvókát</strong> az esetleges filament maradékoktól – ezek befolyásolhatják a szintezés pontosságát!</span>
                                </div>

                                <button
                                    onClick={() => setPhase('abl')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full shadow-md"
                                >
                                    Megértettem, jöhet a Szintezés →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== PHASE 1: Auto Leveling (ABL) ===== */}
                    {phase === 'abl' && (
                        <motion.div
                            key="abl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
                        >
                            {/* LEFT: Image */}
                            <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                                <img
                                    src="/images/modul_main_menu.jpg"
                                    alt="Auto Leveling a Főmenüben"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTO:+Főmenü+Level+Menüpont' }}
                                />
                            </div>

                            {/* RIGHT: UI */}
                            <div className="bg-teal-50 border border-teal-200 p-8 rounded-2xl w-full text-center shadow-sm">
                                <div className="w-16 h-16 bg-teal-100 text-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <ScanLine className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-2">1. Auto Bed Leveling</h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    A főmenüben (a kezdőképernyőn) található <strong>Level</strong> menüpontban indíthatod el az Automatikus Letapogatást. A gép szenzora felméri a fűtött asztal apró egyenetlenségeit, hogy szoftveresen korrigálja azokat.
                                </p>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 flex items-start gap-2 text-left text-xs text-blue-800">
                                    <span className="shrink-0 mt-0.5">ℹ️</span>
                                    <span>Egyes firmware verziókban a "Level" menüpont neve <strong>"Auto Level"</strong> vagy <strong>"Bed Mesh"</strong> is lehet. A funkció ugyanaz, csak a felirat változhat frissítésenként.</span>
                                </div>

                                <div className="bg-white/60 border border-teal-200 rounded-xl p-3 mb-8 flex items-start gap-2 text-left text-xs text-teal-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-teal-500" />
                                    <span><strong>Tipp:</strong> ABL futtatása előtt érdemes a menüben a <strong>Z-offsetet lenullázni</strong>, hogy az új háló tiszta lappal induljon!</span>
                                </div>

                                <button
                                    onClick={() => setPhase('zoffset')}
                                    className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full shadow-md"
                                >
                                    Letapogatás kész, tovább a Z-Offsethez →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== PHASE 2: Z-Offset ===== */}
                    {phase === 'zoffset' && (
                        <motion.div
                            key="zoffset"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
                        >
                            {/* LEFT: Image */}
                            <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                                <img
                                    src="/images/modul3_z_offset_menu.jpg"
                                    alt="Z-offset állítása papírral"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTO:+Z-offset+Befejezese' }}
                                />
                            </div>

                            {/* RIGHT: UI */}
                            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl w-full text-center shadow-sm">
                                <h3 className="text-xl font-bold text-slate-700 mb-2">2. Végső Z-Offset</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Használj egy A4-es papírt a fúvóka és az asztal között.
                                    Állítsd a fejet lefelé (Z-offset), amíg a papír mozgatásakor határozott <strong>súrlódást</strong> nem érzel.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left text-xs text-blue-800 space-y-2 shadow-sm">
                                    <p>
                                        <strong>Fontos:</strong> A tökéletes Z-offset értéke <strong>minden gépen és minden fúvókacsere után más!</strong> Soha ne próbálj egy fix számot (pl. -2.35) vakon beállítani, mindig a papír ellenállására hagyatkozz! (Ebben a szimulációban a mi virtuális gépünk értéke kb. -2.35 mm lesz.)
                                    </p>
                                    <p>
                                        <strong>Mentőöv:</strong> Ha nyomtatás elején látod, hogy a réteg mégsem tapad, a <strong>Baby-stepping</strong> funkcióval menet közben is korrigálhatsz (ezt a 6. modulban gyakoroljuk). Ha pedig menthetetlen a réteg, azonnal <strong>állítsd le a gépet (Stop)</strong>, tisztítsd meg az asztalt, és állítsd be újra a Z-offsetet!
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
                                    <div className="text-4xl font-mono font-bold text-slate-800 mb-6 bg-slate-100 py-4 rounded-lg inline-block px-8 border-b-4 border-slate-300">
                                        {zOffset.toFixed(2)} mm
                                    </div>

                                    <div className="flex justify-center gap-2 sm:gap-4">
                                        <button onClick={() => setZOffset(z => z + 0.05)} className="flex-1 sm:flex-none px-3 py-3 sm:px-6 sm:py-4 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-base sm:text-lg flex flex-col items-center">
                                            <span>+ 0.05</span>
                                            <span className="text-[9px] sm:text-[10px] font-normal text-slate-500 uppercase">Távolabb</span>
                                        </button>
                                        <button onClick={() => setZOffset(z => z - 0.05)} className="flex-1 sm:flex-none px-3 py-3 sm:px-6 sm:py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-base sm:text-lg flex flex-col items-center">
                                            <span>- 0.05</span>
                                            <span className="text-[9px] sm:text-[10px] font-normal text-slate-400 uppercase">Közelebb</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="h-4 w-full bg-gradient-to-r from-red-500 via-green-500 to-yellow-400 rounded-full opacity-80 mb-6 relative mt-4">
                                    <div
                                        className="absolute top-1/2 -mt-3 w-2 h-6 bg-black rounded-full border border-white shadow-sm transition-all"
                                        style={{ left: `${Math.max(0, Math.min(100, ((zOffset + 3.0) / 1.0) * 100))}%` }}
                                    />
                                    <div className="flex justify-between w-full absolute top-6 text-[10px] font-bold text-slate-500">
                                        <span>TÚL KÖZEL</span>
                                        <span>PERFEKT (Súrlódik)</span>
                                        <span>TÚL TÁVOL</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSetZOffset}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold transition-colors w-full mt-10 flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Check className="w-5 h-5" />
                                    Z-Offset Mentése
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== PHASE 3: Done ===== */}
                    {phase === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full text-center py-20"
                        >
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border-4 border-white">
                                <Check className="w-12 h-12" />
                            </div>
                            <h3 className="text-4xl font-extrabold text-slate-800 mb-4">Tökéletes Szintezés!</h3>
                            <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
                                Az asztal most már milliméterre pontosan vízszintben van.
                                A nyomtatás első rétege hibátlanul fog tapadni!
                            </p>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

        </div>
    );
}
