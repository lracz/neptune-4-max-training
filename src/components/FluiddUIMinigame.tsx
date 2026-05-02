import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Network, Search, RefreshCw, Thermometer, Box, Menu, Lightbulb, Globe, Smartphone } from 'lucide-react';
import Confetti from 'react-confetti';

type Phase = 'intro' | 'browser' | 'dashboard';

export default function FluiddUIMinigame() {
    const { completeCurrentStep, addFailure, printerIP, logTelemetry, nextStep } = useAppStore();
    const [phase, setPhase] = useState<Phase>('intro');
    const [ipAddress, setIpAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isDone, setIsDone] = useState(false);

    // Use the IP from Module 1 (stored in Zustand), or fallback
    const TARGET_IP = printerIP || '192.168.1.100';

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ipAddress) return;

        // Remove all spaces, http/https, and trailing slashes
        const cleanInput = ipAddress.replace(/\s+/g, '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const cleanTarget = TARGET_IP.replace(/\s+/g, '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

        const isCorrect = cleanInput === cleanTarget || cleanInput === 'elegoo.local' || cleanInput === 'elegoo';

        if (isCorrect) {
            setIsConnecting(true);
            logTelemetry('FLUIDD_IP_CORRECT', { ip: ipAddress });
            setTimeout(() => {
                setIsConnecting(false);
                setPhase('dashboard');
            }, 1500);
        } else {
            addFailure();
            setIpAddress('');
            setAttempts(prev => prev + 1);
            logTelemetry('FLUIDD_IP_WRONG', { entered: ipAddress, expected: TARGET_IP });
            if (attempts >= 1) {
                setShowHint(true);
            }
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-4 sm:p-10 relative">
            {isDone && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} recycle={false} numberOfPieces={300} />}
            {/* Header & Progress */}
            <div className="mb-6 border-b border-slate-100 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">2. Modul: Fluidd & Klipper</h2>
                    <p className="text-slate-500 mt-1">Irányítsd a gépet a böngésződből kényelmesen!</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-48">
                    <div className={`h-2 flex-1 rounded-full transition-colors ${phase === 'intro' || phase === 'browser' || phase === 'dashboard' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${phase === 'browser' || phase === 'dashboard' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                    <div className={`h-2 flex-1 rounded-full transition-colors ${phase === 'dashboard' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* ===== PHASE 1: Fluidd Introduction & Pre-check ===== */}
                {phase === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                    >
                        {/* LEFT: Image Placeholder */}
                        <div className="w-full aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner hidden md:block">
                            <img
                                src="/images/modul2_fluidd_dashboard.png"
                                alt="Fluidd Irányítópult Kezdőképernyő"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/1e293b/94a3b8?text=FOTÓ:+Fluidd+Nyitólap' }}
                            />
                        </div>

                        {/* RIGHT: Checklist & Info */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Mi az a Fluidd?</h3>
                                <p className="text-slate-600 text-sm md:text-base">
                                    A <strong>Fluidd</strong> a nyomtatód beépített webes felülete (a Klipper rendszer része).
                                    Számítógépről, tabletből vagy telefonról is elérheted, nem kell hozzá külön appot telepíteni!
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider">Hogyan éred el?</h4>
                                <ul className="space-y-4 text-sm text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Smartphone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>Légy ugyanazon a <strong>WiFi hálózaton</strong>, mint a nyomtató (amit az imént beállítottunk).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span>Nyiss egy webböngészőt, és írd be a nyomtató gépnél kapott <strong>IP címét</strong>.<br /> <span className="text-xs text-slate-500">(Nálad most: <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800">{TARGET_IP}</code>)</span></span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Tipp:</strong> Ha Windowst vagy Macet használsz, IP helyett a <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800 font-bold">http://elegoo.local</code> cím is gyakran működik!</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => { setPhase('browser'); logTelemetry('FLUIDD_INTRO_DONE'); }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors text-lg"
                            >
                                Értem, próbáljuk ki! →
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ===== PHASE 2: Browser IP Entry ===== */}
                {phase === 'browser' && (
                    <motion.div
                        key="browser"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center min-h-[400px]"
                    >
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <Network className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Csatlakozás a Fluiddhoz</h2>
                        <p className="text-slate-500 mb-8 max-w-lg text-center">
                            Írd be a nyomtató <strong>IP-címét</strong> az alábbi szimulált böngészőbe a belépéshez!
                        </p>

                        <form onSubmit={handleConnect} className="w-full max-w-md">
                            <div className="relative flex items-center shadow-lg rounded-full overflow-hidden border border-slate-200 focus-within:ring-4 focus-within:ring-blue-100 transition-all bg-white">
                                <div className="pl-6 pr-3 text-slate-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                    placeholder="Pl.: 192.168.1.50"
                                    autoFocus
                                    className="w-full py-4 bg-transparent outline-none text-slate-700 font-mono text-lg placeholder:font-sans placeholder:text-base"
                                    disabled={isConnecting}
                                />
                                <button
                                    type="submit"
                                    disabled={isConnecting || !ipAddress}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-semibold disabled:opacity-50 transition-colors"
                                >
                                    {isConnecting ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Ugrás'}
                                </button>
                            </div>
                        </form>

                        {/* Printi Hint */}
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="mt-8 w-full max-w-md bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4"
                            >
                                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                                    <Lightbulb className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-amber-900 text-sm font-medium">
                                        Emlékszel az IP-re, amit az előző lépésben láttál? A nyomtató kijelzője mutatta.
                                    </p>
                                    <button
                                        onClick={() => setIpAddress(TARGET_IP)}
                                        className="mt-3 text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-4 py-1.5 rounded-full font-bold transition-colors shadow-sm"
                                    >
                                        Segítség: {TARGET_IP}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ===== PHASE 3: Fluidd Dashboard Simulation ===== */}
                {phase === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1e1e24] text-slate-300 min-h-[500px] max-h-[85vh] flex flex-col font-mono rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.15)] outline outline-1 outline-slate-800"
                    >
                        {/* Fake Browser Toolbar */}
                        <div className="bg-[#2d2d34] h-12 flex items-center px-4 gap-4 border-b border-[#3d3d44]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="bg-[#1e1e24] rounded-md px-4 py-1.5 flex-1 text-center text-sm font-sans tracking-widest text-teal-400 font-medium">
                                http://{TARGET_IP}
                            </div>
                        </div>

                        {/* Fluidd Dashboard */}
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex justify-between items-center border-b border-[#3d3d44] pb-4">
                                <div className="flex items-center gap-3">
                                    <Menu className="w-6 h-6 text-teal-500" />
                                    <h1 className="text-2xl font-bold text-white tracking-wider">Fluidd</h1>
                                </div>
                                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-xs border border-green-500/50 font-bold uppercase tracking-widest">
                                    Standby
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Temperature Panel */}
                                <div className="bg-[#25252b] p-6 rounded-xl border border-[#3d3d44] lg:col-span-2 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-orange-500/10 rounded-lg"><Thermometer className="w-5 h-5 text-orange-400" /></div>
                                        <h3 className="font-bold text-sm tracking-widest uppercase text-slate-100">Temperatures</h3>
                                    </div>
                                    {/* Fake Graph */}
                                    <div className="h-44 w-full border-b border-l border-[#444] relative flex items-end">
                                        <div className="w-full border-t border-dashed border-[#444] absolute bottom-1/2 left-0 z-0"></div>
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2.5, ease: "easeOut" }}
                                            className="h-[2px] bg-gradient-to-r from-orange-400 to-orange-500 z-10 origin-left"
                                        />
                                    </div>
                                    <div className="flex gap-10 mt-6">
                                        <div>
                                            <span className="text-xs tracking-wider uppercase text-slate-500 font-bold">Nozzle</span>
                                            <div className="text-3xl font-light text-white mt-1">25.3<span className="text-sm font-normal text-slate-500 ml-1">/ 0°C</span></div>
                                        </div>
                                        <div>
                                            <span className="text-xs tracking-wider uppercase text-slate-500 font-bold">Bed</span>
                                            <div className="text-3xl font-light text-white mt-1">24.8<span className="text-sm font-normal text-slate-500 ml-1">/ 0°C</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls Panel */}
                                <div className="bg-[#25252b] p-6 rounded-xl border border-[#3d3d44] flex flex-col shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-500/10 rounded-lg"><Box className="w-5 h-5 text-blue-400" /></div>
                                        <h3 className="font-bold text-sm tracking-widest uppercase text-slate-100">Toolhead</h3>
                                    </div>
                                    {/* D-Pad Container */}
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="grid grid-cols-3 gap-3 w-48">
                                            <div />
                                            <div className="bg-[#3d3d44] hover:bg-[#4d4d54] h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-colors text-slate-300 font-bold">Y+</div>
                                            <div />
                                            <div className="bg-[#3d3d44] hover:bg-[#4d4d54] h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-colors text-slate-300 font-bold">X-</div>
                                            <div className="bg-[#1e1e24] border-2 border-[#3d3d44] text-teal-500 h-12 rounded-full flex items-center justify-center pointer-events-none text-xs font-bold uppercase tracking-wider">Home</div>
                                            <div className="bg-[#3d3d44] hover:bg-[#4d4d54] h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-colors text-slate-300 font-bold">X+</div>
                                            <div />
                                            <div className="bg-[#3d3d44] hover:bg-[#4d4d54] h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm transition-colors text-slate-300 font-bold">Y-</div>
                                            <div />
                                        </div>
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="text-teal-400 text-sm font-bold bg-teal-500/10 border border-teal-500/20 py-2 px-4 rounded-lg inline-block mb-4">
                                            Sikeres bejelentkezés!
                                        </p>
                                        <button 
                                            onClick={() => {
                                                setIsDone(true);
                                                setTimeout(() => {
                                                    completeCurrentStep();
                                                    nextStep();
                                                }, 2000);
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0"
                                        >
                                            Tovább a 3. Modulra →
                                        </button>
                                        <p className="text-slate-500 text-[10px] mt-3 uppercase tracking-widest font-bold">Irányítsd a gépet a böngészőből!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
