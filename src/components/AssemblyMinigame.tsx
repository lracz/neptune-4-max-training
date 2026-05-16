import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useAppStore } from '../store/appStore';
import { Wifi, Cable, Check, Router } from 'lucide-react';

type Phase = 'safety' | 'ribbon' | 'network_choice' | 'wifi_setup' | 'lan_setup' | 'done';

export default function AssemblyMinigame() {
    const { completeCurrentStep, addFailure, logTelemetry, setPrinterIP } = useAppStore();

    const [phase, setPhase] = useState<Phase>('safety');
    const [safetyChecks, setSafetyChecks] = useState({ unattended: false, clear: false, empty: false, noTouch: false });
    const [hardwareChecks, setHardwareChecks] = useState({ cable: false, switch: false, screen: false });
    const [ribbonConnected, setRibbonConnected] = useState(false);
    const [wifiSSID, setWifiSSID] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiConnecting, setWifiConnecting] = useState(false);
    const [wifiConnected, setWifiConnected] = useState(false);
    const [lanConnected, setLanConnected] = useState(false);

    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Generate a stable IP address once per mount (not on every render!)
    const generatedIP = useMemo(() => `192.168.1.${Math.floor(Math.random() * 200 + 50)}`, []);

    const handleRibbonDragEnd = (_e: any, info: any) => {
        const { offset } = info;
        // Drag upward into the port area
        if (offset.y < -120) {
            setRibbonConnected(true);
            logTelemetry('RIBBON_CONNECTED');
            setTimeout(() => setPhase('network_choice'), 1200);
        } else {
            addFailure();
        }
    };

    const handleLanDragEnd = (_e: any, info: any) => {
        const { offset } = info;
        if (offset.y < -120) {
            setLanConnected(true);
            setPrinterIP(generatedIP); // Save IP to global store for Module 2!
            logTelemetry('LAN_CONNECTED', { ip: generatedIP });
            setTimeout(() => {
                setPhase('done');
                completeCurrentStep();
            }, 1000);
        } else {
            addFailure();
        }
    };

    const handleWifiConnect = () => {
        if (wifiSSID.trim().length < 2) {
            addFailure();
            return;
        }
        setWifiConnecting(true);
        logTelemetry('WIFI_ATTEMPT', { ssid: wifiSSID });
        setTimeout(() => {
            setWifiConnecting(false);
            setWifiConnected(true);
            setPrinterIP(generatedIP); // Save IP to global store for Module 2!
            logTelemetry('WIFI_CONNECTED', { ssid: wifiSSID, ip: generatedIP });
            setTimeout(() => {
                setPhase('done');
                completeCurrentStep();
            }, 1500);
        }, 2500);
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-4 sm:p-6 md:p-10 relative">
            {phase === 'done' && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}
            {/* Header & Progress */}
            <div className="mb-6 border-b border-slate-100 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Összeszerelés & Csatlakozás</h2>
                    <p className="text-sm text-slate-500 mt-1">Kövesd a lépéseket a gép alapvető bekötéséhez!</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-64">
                    <div className={`h-2 flex-1 rounded-full transition-colors ${phase !== 'safety' ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${ribbonConnected ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${phase === 'wifi_setup' || phase === 'lan_setup' || phase === 'done' ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${phase === 'done' ? 'bg-teal-500' : 'bg-slate-200'}`} />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ===== PHASE 0: Safety Check ===== */}
                {phase === 'safety' && (
                    <motion.div
                        key="safety"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="max-w-2xl mx-auto py-4 sm:py-8"
                    >
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-sm">
                            <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                                <span className="text-xl sm:text-2xl">⚠️</span> Labor Biztonsági Szabályok
                            </h3>
                            <p className="text-red-700/90 text-xs sm:text-sm mb-6">
                                Mielőtt hozzáérnél a géphez, kérjük olvasd el és igazold vissza a legfontosabb biztonsági előírásokat! A nyomtatóban mozgó, becsípődés-veszélyes és forró alkatrészek is találhatók.
                            </p>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={safetyChecks.unattended}
                                        onChange={(e) => setSafetyChecks((prev: any) => ({ ...prev, unattended: e.target.checked }))}
                                        className="w-5 h-5 accent-red-500 rounded cursor-pointer shrink-0 mt-0.5"
                                    />
                                    <span className="text-slate-700 text-sm font-medium">A nyomtatót soha nem hagyom felügyelet nélkül működés közben, vagy gondoskodom távfelügyeletről.</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={safetyChecks.clear}
                                        onChange={(e) => setSafetyChecks((prev: any) => ({ ...prev, clear: e.target.checked }))}
                                        className="w-5 h-5 accent-red-500 rounded cursor-pointer shrink-0 mt-0.5"
                                    />
                                    <span className="text-slate-700 text-sm font-medium">Megbizonyosodtam róla, hogy a nyomtató mozgásterében nincs semmilyen akadályozó tárgy (pl. kábel, szerszám, táska).</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={safetyChecks.empty}
                                        onChange={(e) => setSafetyChecks((prev: any) => ({ ...prev, empty: e.target.checked }))}
                                        className="w-5 h-5 accent-red-500 rounded cursor-pointer shrink-0 mt-0.5"
                                    />
                                    <span className="text-slate-700 text-sm font-medium">Ellenőriztem, hogy nem esett semmi a nyomtató mozgó alkatrészei vagy a fűtött asztal alá.</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={safetyChecks.noTouch}
                                        onChange={(e) => setSafetyChecks((prev: typeof safetyChecks) => ({...prev, noTouch: e.target.checked}))}
                                        className="w-5 h-5 accent-red-500 rounded cursor-pointer shrink-0 mt-0.5" 
                                    />
                                    <span className="text-slate-700 text-sm font-medium">A nyomtatási felület (PEI lap) <strong>közepéhez sosem nyúlok puszta kézzel</strong> (a bőrzsír rontja a tapadást). A szélénél fogva viszont szabadon mozgatható!</span>
                                </label>
                            </div>
                        </div>
                        <button
                            disabled={!safetyChecks.unattended || !safetyChecks.clear || !safetyChecks.empty || !safetyChecks.noTouch}
                            onClick={() => { logTelemetry('SAFETY_AGREED'); setPhase('ribbon'); }}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm"
                        >
                            Tudomásul vettem, kezdhetjük!
                        </button>
                    </motion.div>
                )}

                {/* ===== PHASE 1: Ribbon Cable ===== */}
                {phase === 'ribbon' && (
                    <motion.div
                        key="ribbon"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    >
                        {/* LEFT: Image Placeholder */}
                        <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                            <img
                                src="/images/modul1_ribbon.jpg"
                                alt="Kijelző szalagkábel"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTÓ:+Kijelző+Port' }}
                            />
                        </div>

                        {/* RIGHT: Interaction */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">1. Kijelző csatlakoztatása</h3>
                                <div className="text-sm text-slate-600 mb-4 space-y-2">
                                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-500" /> Keresd meg a gép oldalán lévő portot.</p>
                                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-500" /> Dugd be a göndör kábelt ütközésig.</p>
                                </div>
                            </div>

                            <div className="relative bg-slate-800 rounded-2xl h-[280px] flex flex-col items-center justify-between border-4 border-slate-700 p-6">
                                {/* Port at the top */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">Kijelző Port</span>
                                    <div
                                        ref={dropZoneRef}
                                        className={`w-24 h-8 rounded-lg flex items-center justify-center border-4 border-dashed transition-all duration-300
                                            ${ribbonConnected ? 'bg-teal-900 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-black/60 border-slate-500 animate-pulse'}`}
                                    >
                                        {ribbonConnected && <Check className="w-5 h-5 text-teal-400" />}
                                    </div>
                                </div>

                                {/* Draggable ribbon cable */}
                                {!ribbonConnected ? (
                                    <motion.div
                                        drag="y"
                                        dragConstraints={{ top: -150, bottom: 0 }}
                                        dragSnapToOrigin
                                        onDragEnd={handleRibbonDragEnd}
                                        className="cursor-grab active:cursor-grabbing flex flex-col items-center gap-3"
                                    >
                                        <div className="w-20 h-6 bg-gradient-to-b from-slate-300 to-slate-400 rounded border-2 border-slate-500 shadow-lg relative flex items-center justify-center">
                                            <div className="w-12 h-1 bg-amber-500 rounded-full" />
                                            <div className="absolute -bottom-10 w-6 h-10 bg-gradient-to-b from-slate-400 to-slate-600 rounded-b-lg" />
                                        </div>
                                        <span className="mt-8 px-4 py-1.5 bg-white/90 text-slate-700 rounded-full text-xs font-bold shadow pointer-events-none">
                                            📺 Húzd fel a kábelt!
                                        </span>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-teal-400 text-center">
                                        <Check className="w-10 h-10 mx-auto mb-2" />
                                        <p className="font-bold">Csatlakoztatva!</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== PHASE 2: Network Choice ===== */}
                {phase === 'network_choice' && (
                    <motion.div
                        key="network_choice"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    >
                        {/* LEFT: Image Placeholder (Antenna & LAN) */}
                        <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                            <img
                                src="/images/modul1_feszultseg_kapcsolo.jpg"
                                alt="Hálózati portok és antenna"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTÓ:+LAN+Port+és+WiFi+Antenna' }}
                            />
                        </div>

                        {/* RIGHT: Interaction & Hardware Checklist */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">2. Hálózat és Alkatrészek</h3>
                                <p className="text-sm text-slate-600 mb-4">Mielőtt online-ra állítjuk a gépet, fusd át ezt a gyors fizikai ellenőrzőlistát!</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={hardwareChecks.cable}
                                        onChange={() => setHardwareChecks((prev: any) => ({ ...prev, cable: !prev.cable }))}
                                        className="w-5 h-5 accent-teal-500 rounded cursor-pointer" 
                                    />
                                    <span className="group-hover:text-teal-700 transition-colors"><strong>Tápkábel</strong> bedugva a gépbe és a konnektorba</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={hardwareChecks.switch}
                                        onChange={() => setHardwareChecks((prev: any) => ({ ...prev, switch: !prev.switch }))}
                                        className="w-5 h-5 accent-teal-500 rounded cursor-pointer" 
                                    />
                                    <span className="group-hover:text-teal-700 transition-colors">Hátoldali <strong>kapcsoló ON</strong> helyzetbe rakva (Piros kapcsoló)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={hardwareChecks.screen}
                                        onChange={() => setHardwareChecks((prev: any) => ({ ...prev, screen: !prev.screen }))}
                                        className="w-5 h-5 accent-teal-500 rounded cursor-pointer" 
                                    />
                                    <span className="group-hover:text-teal-700 transition-colors">A <strong>kijelző bekapcsolt</strong> és a főmenü látszik</span>
                                </label>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 mb-3">Hogyan csatlakozol?</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        disabled={!hardwareChecks.cable || !hardwareChecks.switch || !hardwareChecks.screen}
                                        onClick={() => { setPhase('wifi_setup'); logTelemetry('NETWORK_CHOICE', { method: 'wifi' }); }}
                                        className="flex flex-col items-center gap-2 p-4 bg-sky-50 rounded-xl border border-sky-200 hover:border-sky-400 hover:bg-sky-100 transition-all text-sky-900 disabled:opacity-30 disabled:grayscale"
                                    >
                                        <Wifi className="w-6 h-6" />
                                        <span className="font-bold">WiFi</span>
                                    </button>
                                    <button
                                        disabled={!hardwareChecks.cable || !hardwareChecks.switch || !hardwareChecks.screen}
                                        onClick={() => { setPhase('lan_setup'); logTelemetry('NETWORK_CHOICE', { method: 'lan' }); }}
                                        className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100 transition-all text-emerald-900 disabled:opacity-30 disabled:grayscale"
                                    >
                                        <Cable className="w-6 h-6" />
                                        <span className="font-bold">LAN (Kábel)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== PHASE 3A: WiFi Setup ===== */}
                {phase === 'wifi_setup' && (
                    <motion.div
                        key="wifi_setup"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    >
                        {/* LEFT: Placeholder Image */}
                        <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                            <img
                                src="/images/modul1_wifi_screen.jpg"
                                alt="Kijelző hálózat menü"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTÓ:+Képernyő+WiFi+Menü' }}
                            />
                        </div>

                        {/* RIGHT: UI */}
                        <div className="bg-slate-800 rounded-2xl p-6 border-4 border-slate-700">
                            <div className="bg-slate-900 rounded-xl p-6 border border-slate-600 shadow-inner">
                                <div className="flex items-center gap-2 mb-5 text-sky-400">
                                    <Wifi className="w-5 h-5" />
                                    <span className="font-mono text-sm font-bold">WiFi Beállítások</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-400 text-xs font-mono block mb-1">Hálózat neve (SSID)</label>
                                        <input
                                            type="text"
                                            value={wifiSSID}
                                            onChange={(e) => setWifiSSID(e.target.value)}
                                            placeholder="pl. Suli_WiFi_5G"
                                            disabled={wifiConnecting || wifiConnected}
                                            className="w-full bg-slate-800 border bg-slate-800 border-slate-600 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:border-sky-500 focus:outline-none disabled:opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 text-xs font-mono block mb-1">Jelszó</label>
                                        <input
                                            type="password"
                                            value={wifiPassword}
                                            onChange={(e) => setWifiPassword(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={wifiConnecting || wifiConnected}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:border-sky-500 focus:outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {wifiConnecting && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 flex items-center gap-3 text-amber-400">
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Router className="w-5 h-5" /></motion.div>
                                        <span className="font-mono text-sm">Csatlakozás folyamatban...</span>
                                    </motion.div>
                                )}

                                {wifiConnected && (
                                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 flex items-center gap-3 text-teal-400">
                                        <Check className="w-5 h-5" />
                                        <span className="font-mono text-sm font-bold">Csatlakozva! IP: {generatedIP}</span>
                                    </motion.div>
                                )}

                                {!wifiConnecting && !wifiConnected && (
                                    <button onClick={handleWifiConnect} className="mt-5 w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-lg transition-colors">
                                        Csatlakozás
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===== PHASE 3B: LAN Setup ===== */}
                {phase === 'lan_setup' && (
                    <motion.div
                        key="lan_setup"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    >
                        {/* LEFT: Placeholder */}
                        <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                            <img
                                src="/images/modul1_lan_port.jpg"
                                alt="LAN Kábel port"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTÓ:+LAN+Port' }}
                            />
                        </div>

                        {/* RIGHT: UI */}
                        <div className="relative bg-slate-800 rounded-2xl h-[380px] flex flex-col items-center justify-between border-4 border-slate-700 p-6">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">RJ45 Port</span>
                                <div className={`w-16 h-14 rounded-md flex items-center justify-center border-4 border-dashed transition-all duration-300
                                    ${lanConnected ? 'bg-teal-900 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-black/60 border-slate-500 animate-pulse'}`}
                                >
                                    {lanConnected ? <Check className="w-6 h-6 text-teal-400" /> : <Cable className="w-5 h-5 text-slate-500" />}
                                </div>
                            </div>

                            {!lanConnected ? (
                                <motion.div
                                    drag="y"
                                    dragConstraints={{ top: -150, bottom: 0 }}
                                    dragSnapToOrigin
                                    onDragEnd={handleLanDragEnd}
                                    className="cursor-grab active:cursor-grabbing flex flex-col items-center gap-3"
                                >
                                    <div className="w-10 h-14 bg-blue-500 rounded-md border-b-8 border-blue-700 shadow-xl relative flex justify-center items-start">
                                        <div className="w-3 h-4 bg-yellow-400 absolute -top-4 rounded-t-sm" />
                                        <div className="w-2 h-20 bg-blue-300 absolute top-full" />
                                    </div>
                                    <span className="mt-16 px-4 py-1.5 bg-white/90 text-slate-700 rounded-full text-xs font-bold shadow pointer-events-none">
                                        🔌 Húzd fel a kábelt!
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-teal-400 text-center">
                                    <Check className="w-12 h-12 mx-auto mb-2" />
                                    <p className="font-bold">Ethernet csatlakoztatva!</p>
                                    <p className="text-xs font-mono text-teal-200 mt-2">IP: {generatedIP}</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ===== DONE ===== */}
                {phase === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-10 text-center border-2 border-teal-200"
                    >
                        <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={250} />
                        <Check className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-extrabold text-teal-800 mb-2">Összeszerelés Kész!</h3>
                        <p className="text-teal-600 font-medium">A nyomtatód hardveresen be van kötve és csatlakozik a hálózathoz.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
