import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, BADGES } from '../store/appStore';
import { X } from 'lucide-react';
import Confetti from 'react-confetti';

export default function BadgePopup() {
    const { latestBadge, dismissBadge } = useAppStore();

    const badge = BADGES.find(b => b.id === latestBadge);

    return (
        <AnimatePresence>
            {badge && (
                <>
                    <Confetti
                        width={typeof window !== 'undefined' ? window.innerWidth : 1000}
                        height={typeof window !== 'undefined' ? window.innerHeight : 1000}
                        recycle={false}
                        numberOfPieces={150}
                        gravity={0.2}
                        colors={['#f59e0b', '#eab308', '#fbbf24', '#fcd34d', '#fef3c7']}
                    />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={dismissBadge}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center"
                    >
                        {/* Badge Card */}
                        <motion.div
                            initial={{ scale: 0.3, opacity: 0, rotateZ: -10 }}
                            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-10 shadow-2xl max-w-sm mx-4 text-center relative overflow-hidden border-2 border-yellow-200"
                        >
                            {/* Glow effect behind emoji */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 bg-yellow-100 rounded-full blur-3xl opacity-50" />
                            </div>

                            <button
                                onClick={dismissBadge}
                                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </button>

                            <motion.div
                                initial={{ scale: 0, rotateZ: -180 }}
                                animate={{ scale: 1, rotateZ: 0 }}
                                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                                className="text-7xl mb-4 relative z-10"
                            >
                                {badge.emoji}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <p className="text-xs uppercase tracking-[0.2em] font-bold text-yellow-600 mb-2">
                                    🏆 Új Jelvény Feloldva!
                                </p>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">{badge.name}</h3>
                                <p className="text-slate-500 text-sm mb-6">{badge.desc}</p>

                                <button
                                    onClick={dismissBadge}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-8 py-3 rounded-xl font-bold transition-colors shadow-md w-full"
                                >
                                    Szuper! 🎉
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
