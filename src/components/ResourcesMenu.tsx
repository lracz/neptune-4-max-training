import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { Library, Lock, X, ExternalLink, Cuboid, Wrench, Search, Gift } from 'lucide-react';
import Confetti from 'react-confetti';

const RESOURCES = [
    {
        category: 'Készítsd el sajátod (Modellezés & AI)',
        icon: <Wrench className="w-5 h-5 text-indigo-500" />,
        items: [
            {
                title: 'Tinkercad',
                desc: 'Egyszerű, színes, böngészős 3D építő. Kezdőknek a legjobb!',
                url: 'https://www.tinkercad.com/',
                color: 'bg-blue-50 border-blue-200'
            },
            {
                title: 'Tripo3D / Meshy.ai',
                desc: 'Generálj 3D modellt szövegből vagy képekből mesterséges intelligenciával.',
                url: 'https://www.meshy.ai/',
                color: 'bg-purple-50 border-purple-200'
            },
            {
                title: 'Spline',
                desc: 'Látványos, modern webes 3D tervező haladóknak.',
                url: 'https://spline.design/',
                color: 'bg-pink-50 border-pink-200'
            }
        ]
    },
    {
        category: 'Tölts le kész modelleket (Könyvtárak)',
        icon: <Search className="w-5 h-5 text-emerald-500" />,
        items: [
            {
                title: 'Printables',
                desc: 'Minőségi modellek a Prusától, külön oktatási (Education) kategóriával.',
                url: 'https://www.printables.com/',
                color: 'bg-orange-50 border-orange-200'
            },
            {
                title: 'Thingiverse',
                desc: 'A világ legrégebbi és legnagyobb ingyenes 3D modell archívuma.',
                url: 'https://www.thingiverse.com/',
                color: 'bg-sky-50 border-sky-200'
            },
            {
                title: 'Thangs',
                desc: 'Univerzális 3D geometriai keresőmotor több millió modellel.',
                url: 'https://thangs.com/',
                color: 'bg-teal-50 border-teal-200'
            }
        ]
    }
];

export default function ResourcesMenu() {
    const { currentStep } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const [showUnlockAnim, setShowUnlockAnim] = useState(false);
    const [hasUnlocked, setHasUnlocked] = useState(false); // Track globally once unlocked

    // It unlocks at Step 5 (Slicer phase)
    const isUnlocked = currentStep >= 5;

    // Trigger unlock animation only once when they transition to step 5
    useEffect(() => {
        if (isUnlocked && !hasUnlocked) {
            setHasUnlocked(true);
            setShowUnlockAnim(true);
            // Hide confetti after 4 seconds
            setTimeout(() => setShowUnlockAnim(false), 4000);
        }
    }, [isUnlocked, hasUnlocked]);

    const handleOpen = () => {
        if (isUnlocked) setIsOpen(true);
    };

    return (
        <>
            {showUnlockAnim && <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 1000} height={typeof window !== 'undefined' ? window.innerHeight : 1000} recycle={false} numberOfPieces={200} gravity={0.3} />}

            {/* Floating Button (Bottom Left) */}
            <motion.button
                onClick={handleOpen}
                whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                animate={showUnlockAnim ? {
                    scale: [1, 1.2, 1, 1.2, 1],
                    rotate: [0, -10, 10, -10, 0],
                } : {}}
                transition={{ duration: 0.5 }}
                className={`fixed bottom-6 left-6 p-4 rounded-full shadow-2xl flex items-center gap-3 transition-colors z-40
          ${isUnlocked
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }
        `}
            >
                <div className="relative">
                    {isUnlocked ? <Gift className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    {showUnlockAnim && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                    )}
                </div>
                <span className="font-bold hidden sm:block pr-2">
                    {isUnlocked ? 'Erőforrások' : 'Zárolva (5. Modul)'}
                </span>
            </motion.button>

            {/* Modal / Side Panel Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-r border-slate-200"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <Library className="w-12 h-12 mb-4 opacity-90" />
                                <h2 className="text-3xl font-extrabold mb-2">Könyvtár</h2>
                                <p className="text-indigo-100 text-sm">
                                    Modellezz saját tárgyakat, vagy tölts le kész STL fájlokat a világ legjobb 3D adatbázisaiból!
                                </p>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
                                {RESOURCES.map((section, sId) => (
                                    <div key={sId}>
                                        <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-4 uppercase tracking-wider text-xs">
                                            {section.icon}
                                            {section.category}
                                        </h3>

                                        <div className="space-y-4">
                                            {section.items.map((item, iId) => (
                                                <a
                                                    key={iId}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`block p-4 rounded-2xl border ${item.color} hover:shadow-md transition-all group`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                            {item.title}
                                                        </h4>
                                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                                                    </div>
                                                    <p className="text-sm text-slate-600 line-clamp-2">
                                                        {item.desc}
                                                    </p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start gap-3 mt-8">
                                    <Cuboid className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800 text-sm">Tipp a Szeletelőhöz</h4>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Az innen letöltött `.stl` vagy `.obj` fájlokat ugyanúgy be tudod húzni az Elegoo Curába, ahogy a Benchy hajót próbáltad!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
