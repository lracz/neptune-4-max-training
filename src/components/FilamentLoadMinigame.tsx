import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Thermometer, ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import Confetti from 'react-confetti';

type FilamentPhase = 'intro' | 'sensor' | 'load';

export default function FilamentLoadMinigame() {
    const { completeCurrentStep } = useAppStore();

    const [phase, setPhase] = useState<FilamentPhase>('intro');
    const [matchedTypes, setMatchedTypes] = useState<string[]>([]);
    const [targetTemp, setTargetTemp] = useState(0); // Expected: 200
    const [currentTemp, setCurrentTemp] = useState(25);
    const [isHeating, setIsHeating] = useState(false);
    const [isHeated, setIsHeated] = useState(false);
    const [extrudedLength, setExtrudedLength] = useState(0);
    const [isDone, setIsDone] = useState(false);

    // Simulate Heating
    useEffect(() => {
        if (isHeating && currentTemp < targetTemp) {
            const timer = setTimeout(() => setCurrentTemp(c => Math.min(c + 5, targetTemp)), 100);
            return () => clearTimeout(timer);
        }
        if (isHeating && currentTemp >= 200) {
            setIsHeating(false);
            setIsHeated(true);
        }
    }, [isHeating, currentTemp, targetTemp]);

    const handleStartHeating = () => {
        setTargetTemp(200);
        setIsHeating(true);
    };

    const handleExtrude = () => {
        if (!isHeated) return;

        const newLen = extrudedLength + 20;
        setExtrudedLength(newLen);

        if (newLen >= 100 && !isDone) {
            setIsDone(true);
            completeCurrentStep();
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-4 sm:p-10 relative min-h-[500px]">
            {isDone && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Filament Betöltés</h2>
                    <p className="text-slate-500 mt-2 max-w-xl">
                        A műanyagszálat először a <strong>filament érzékelőn</strong> (runout sensor) kell átfűzni, majd bele kell vezetni a fúvókába (Hotend).
                    </p>
                </div>

                {/* Phase Timeline Indicator */}
                <div className="hidden sm:flex items-center gap-3 text-sm font-semibold mt-4 md:mt-0">
                    <div className={`flex flex-col items-center gap-2 ${phase === 'intro' ? 'text-purple-600' : 'text-slate-400'}`}>
                        <div className={`p-2 rounded-full ${phase === 'intro' ? 'bg-purple-100' : 'bg-slate-100'}`}><CheckCircle2 className="w-5 h-5" /></div>
                        Anyagismeret
                    </div>
                    <div className="w-5 h-1 bg-slate-200 rounded-full" />
                    <div className={`flex flex-col items-center gap-2 ${phase === 'sensor' ? 'text-blue-600' : 'text-slate-400'}`}>
                        <div className={`p-2 rounded-full ${phase === 'sensor' ? 'bg-blue-100' : 'bg-slate-100'}`}><ArrowRight className="w-5 h-5" /></div>
                        Szenzor
                    </div>
                    <div className="w-5 h-1 bg-slate-200 rounded-full" />
                    <div className={`flex flex-col items-center gap-2 ${phase === 'load' ? 'text-orange-600' : 'text-slate-400'}`}>
                        <div className={`p-2 rounded-full ${phase === 'load' ? 'bg-orange-100' : 'bg-slate-100'}`}><Thermometer className="w-5 h-5" /></div>
                        Fűtés & Betolás
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center">
                <AnimatePresence mode="wait">

                    {/* ===== PHASE 0: Intro / Filament Identification ===== */}
                    {phase === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg">
                                    <img 
                                        src="/images/modul4_filament_types.png" 
                                        alt="Filament típusok" 
                                        className="w-full h-auto"
                                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/1e293b/94a3b8?text=Filament+Tipusok' }}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-700">Ismerd meg az anyagokat!</h3>
                                    <p className="text-sm text-slate-500">Mielőtt elkezdenéd a nyomtatást, fontos tudnod, melyik anyag mire való. Párosítsd össze a leírásokat a filament típusokkal!</p>
                                    
                                    <div className="space-y-2">
                                        {[
                                            { id: 'pla', name: 'PLA', desc: 'Legnépszerűbb, biológiailag lebontható, könnyű vele nyomtatni. Ideális dísztárgyakhoz.' },
                                            { id: 'petg', name: 'PETG', desc: 'Erősebb, hőállóbb, mint a PLA. Mechanikai alkatrészekhez és kültérre is alkalmas.' },
                                            { id: 'tpu', name: 'TPU', desc: 'Rugalmas, gumiszerű anyag. Tömítésekhez, telefontokokhoz használják.' }
                                        ].map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => {
                                                    if (!matchedTypes.includes(f.id)) {
                                                        setMatchedTypes([...matchedTypes, f.id]);
                                                    }
                                                }}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                                                    ${matchedTypes.includes(f.id) 
                                                        ? 'bg-green-50 border-green-300 text-green-800' 
                                                        : 'bg-white border-slate-200 hover:border-purple-300 text-slate-700 hover:bg-slate-50'}`}
                                            >
                                                <div>
                                                    <span className="font-bold block">{f.name}</span>
                                                    <span className="text-xs opacity-70">{f.desc}</span>
                                                </div>
                                                {matchedTypes.includes(f.id) && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        disabled={matchedTypes.length < 3}
                                        onClick={() => setPhase('sensor')}
                                        className="w-full mt-4 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold disabled:opacity-50 transition-all shadow-md"
                                    >
                                        Tovább a Befűzéshez
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== PHASE 1: Sensor ===== */}
                    {phase === 'sensor' && (
                        <motion.div
                            key="sensor"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
                        >
                            {/* LEFT: Image */}
                            <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                                <img
                                    src="/images/modul4_szenzor.jpg"
                                    alt="Filament befűzése a kifogyás érzékelőbe"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTO:+Kifogyas+Erzekelo' }}
                                />
                            </div>

                            {/* RIGHT: UI */}
                            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl w-full text-center shadow-sm">
                                <h3 className="text-xl font-bold text-slate-700 mb-4">1. Kifogyás Érzékelő (Runout Sensor)</h3>
                                <p className="text-sm text-slate-500 mb-6 text-left leading-relaxed">
                                    Vedd a műanyagszál (filament) végét, vágd le egyenesre vagy 45 fokos szögben egy csípőfogóval, majd fűzd át a gép tetején található fekete <strong>kifogyás érzékelőn</strong>.
                                </p>
                                <p className="text-sm text-slate-500 mb-8 text-left leading-relaxed">
                                    Húzd át rajta egészen addig, amíg el nem éri az extrudert (a nyomtatófejet). Ez az érzékelő fogja megállítani a nyomtatást, ha elfogyna a szál, így megmentve a munkádat!
                                </p>

                                <button
                                    onClick={() => setPhase('load')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-colors w-full shadow-md flex items-center justify-center gap-2"
                                >
                                    Befűztem, jöhet a fejbe töltés <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== PHASE 2: Load & Extrude ===== */}
                    {phase === 'load' && (
                        <motion.div
                            key="load"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
                        >
                            {/* LEFT: Image */}
                            <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block relative">
                                <img
                                    src="/images/modul4_fej_kar.jpg"
                                    alt="Extruder kar lenyomása"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTO:+Extruder+Kar+Es+Filament' }}
                                />
                                {/* Visualizer overlay for extrusion when done */}
                                {isDone && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 px-6 py-3 rounded-full font-bold text-teal-600 shadow-2xl border border-teal-100 flex items-center gap-2 z-30"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Sikeres betöltés!
                                    </motion.div>
                                )}
                            </div>

                            {/* RIGHT: UI */}
                            <div className="flex-1 space-y-6 w-full">
                                <div className={`p-6 rounded-2xl border-2 transition-all shadow-sm ${isHeated ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">2. Felfűtés (200°C)</h3>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                        Mielőtt betolnád a filamentet a fejbe, fel kell fűteni a fúvókát <strong>200°C</strong>-ra.
                                        A kijelzőn a <strong>Prepare → Temp → Nozzle</strong> menüpontban állíthatod a hőmérsékletet.
                                        <strong>Egyszerűbb módszer:</strong> a <strong>Prepare → Preheat PLA</strong> gombra kattintva a gép automatikusan a PLA-hoz megfelelő hőmérsékletre melegít (asztal: 60°C, fúvóka: 200°C).
                                    </p>
                                    <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3 flex items-start gap-2 text-left text-xs text-red-800">
                                        <Thermometer className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                                        <span>⚠️ <strong>ÉGÉSVESZÉLY!</strong> A fúvóka <strong>200°C</strong>-ra hevül fel – ez azonnali égési sérülést okoz! <strong>Soha ne érintsd meg</strong> a fém alkatrészeket (heatblock, nozzle) fűtés közben és után. Csak a műanyag fogantyúknál fogd meg az extrudert.</span>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2 text-left text-xs text-blue-800">
                                        <span className="shrink-0 mt-0.5">ℹ️</span>
                                        <span>Az ajánlott hőmérséklet a <strong>filament típusától</strong> függ (PLA: 190-220°C, PETG: 230-250°C). A pontos értéket mindig a filament tekercs címkéjén ellenőrizd! A kijelzőn a hőmérséklet állítása a <strong>Prepare → Temp</strong> menüben található.</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                                            <Thermometer className={`w-6 h-6 ${isHeated ? 'text-green-500' : 'text-orange-500'}`} />
                                            Fúvóka
                                        </div>
                                        <div className="text-3xl font-mono font-black text-slate-800">
                                            {currentTemp}°C <span className="text-sm font-sans font-medium text-slate-500">/ 200°C</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                                        <motion.div
                                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-full"
                                            animate={{ width: `${Math.min(100, ((currentTemp - 25) / 175) * 100)}%` }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleStartHeating}
                                        disabled={isHeating || isHeated}
                                        className="w-full py-4 text-white font-bold rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {isHeated ? 'Felmelegítve!' : isHeating ? 'Fűtés folyamatban...' : 'Felfűtés 200°C-ra'}
                                    </button>
                                </div>

                                <div className={`p-6 rounded-2xl border-2 transition-all shadow-sm ${isDone ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                                    <h3 className="font-bold text-slate-700 mb-2">3. Extrudálás (Betolás)</h3>
                                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                        Ez a funkció a kijelzőn a <strong>Prepare → Extruder</strong> menüpont alatt található.
                                        Nyomd le a képen látható feszítőkart az ujjaiddal, told be a szálat ütközésig a nyomtatófejbe, majd nyomogasd az extrudálás gombot, amíg folytonos, megolvadt szál nem jön a fúvókából!
                                    </p>

                                    <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden border border-slate-200">
                                        <motion.div
                                            className="bg-blue-500 h-full"
                                            animate={{ width: `${Math.min(100, extrudedLength)}%` }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleExtrude}
                                        disabled={!isHeated || isDone}
                                        className="w-full flex items-center justify-center gap-2 py-4 text-white font-bold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors shadow-sm"
                                    >
                                        {isDone ? (
                                            <>
                                                <CheckCircle2 className="w-6 h-6" />
                                                Betöltés Kész!
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-6 h-6" />
                                                Extrudálás (Betolás)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

