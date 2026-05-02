import { motion } from 'framer-motion';
import { useAppStore, BADGES } from '../store/appStore';
import { Trophy, Star, Clock, Target, Award, Zap, RotateCcw, Unlock, FileText, Link, Printer } from 'lucide-react';
import Confetti from 'react-confetti';

const MODULE_NAMES = [
    'Összeszerelés',
    'Fluidd UI',
    'Szintezés',
    'Filament',
    'Slicer',
    'Első Nyomtatás',
    'Levétel',
];

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function StarRating({ stars }: { stars: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3].map(i => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                />
            ))}
        </div>
    );
}

export default function CompletionScreen() {
    const {
        totalScore,
        xp,
        level,
        completedSteps,
        moduleFailures,
        moduleTimes,
        unlockedBadges,
        getModuleStars,
        getTotalTime,
    } = useAppStore();

    const totalStars = Array.from({ length: 7 }, (_, i) => getModuleStars(i + 1)).reduce((a, b) => a + b, 0);
    const maxStars = 21;
    const totalTime = getTotalTime();
    const totalFailures = Object.values(moduleFailures).reduce((a, b) => a + b, 0);

    return (
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
            <Confetti
                width={typeof window !== 'undefined' ? window.innerWidth : 1000}
                height={typeof window !== 'undefined' ? window.innerHeight : 1000}
                recycle={false}
                numberOfPieces={400}
                gravity={0.15}
            />

            {/* Hero Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 sm:p-14 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-8xl">🏆</div>
                    <div className="absolute bottom-10 right-10 text-8xl">🎓</div>
                    <div className="absolute top-20 right-20 text-6xl">⭐</div>
                </div>

                <motion.div
                    initial={{ scale: 0, rotateZ: -20 }}
                    animate={{ scale: 1, rotateZ: 0 }}
                    transition={{ type: 'spring', damping: 12 }}
                    className="relative z-10"
                >
                    <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">Kurzus Teljesítve!</h1>
                    <p className="text-teal-100 text-lg max-w-lg mx-auto">
                        Gratulálunk! Sikeresen elvégezted az Elegoo Neptune 4 Max Mesterkurzust.
                    </p>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-10 -mt-8 relative z-10">
                {[
                    { icon: <Target className="w-6 h-6" />, label: 'Pontszám', value: `${totalScore}`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { icon: <Zap className="w-6 h-6" />, label: 'XP', value: `${xp} XP`, color: 'bg-purple-50 border-purple-200 text-purple-700' },
                    { icon: <Star className="w-6 h-6" />, label: 'Csillagok', value: `${totalStars}/${maxStars}`, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { icon: <Clock className="w-6 h-6" />, label: 'Idő', value: formatTime(totalTime), color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i + 0.3 }}
                        className={`${stat.color} border rounded-2xl p-5 text-center shadow-sm`}
                    >
                        <div className="flex justify-center mb-2 opacity-70">{stat.icon}</div>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-xs font-bold uppercase tracking-wider opacity-60 mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Level Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="mx-6 sm:mx-10 mb-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 flex items-center gap-6 text-white shadow-lg"
            >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-md shrink-0">
                    {level === 'Nagymester' ? '👑' : level === 'Mester' ? '🏅' : level === 'Haladó' ? '🎯' : '🌱'}
                </div>
                <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Elért szint</div>
                    <div className="text-3xl font-black">{level}</div>
                </div>
                <div className="ml-auto text-right hidden sm:block">
                    <div className="text-slate-400 text-xs font-bold">Szint határ</div>
                    <div className="text-sm text-slate-300">
                        {xp >= 1200 ? '1200+ XP ✓' : xp >= 800 ? `${xp}/1200 XP` : xp >= 400 ? `${xp}/800 XP` : `${xp}/400 XP`}
                    </div>
                    {/* XP Bar */}
                    <div className="w-32 bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (xp / 1400) * 100)}%` }}
                            transition={{ delay: 1, duration: 1 }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Module Breakdown Table */}
            <div className="px-6 sm:px-10 mb-8">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Modulonkénti eredmények
                </h3>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    {MODULE_NAMES.slice(0, 6).map((name, i) => {
                        const moduleId = i + 1;
                        const isCompleted = completedSteps.includes(moduleId);
                        const fails = moduleFailures[moduleId] || 0;
                        const stars = getModuleStars(moduleId);
                        const time = moduleTimes[moduleId];
                        const badge = BADGES.find(b => b.moduleId === moduleId);
                        const hasBadge = badge && unlockedBadges.includes(badge.id);

                        return (
                            <motion.div
                                key={moduleId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * i + 1.2 }}
                                className={`flex items-center gap-4 px-5 py-4 ${i < 5 ? 'border-b border-slate-100' : ''} ${isCompleted ? '' : 'opacity-40'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                                    {moduleId}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-700 text-sm truncate">{name}</div>
                                    <div className="text-xs text-slate-400">
                                        {isCompleted ? `${fails} hiba` : 'Nem teljesítve'}
                                        {time ? ` · ${formatTime(time)}` : ''}
                                    </div>
                                </div>
                                <StarRating stars={stars} />
                                <div className="w-8 text-center text-lg" title={hasBadge ? badge?.name : 'Nincs jelvény'}>
                                    {hasBadge ? badge?.emoji : '🔒'}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Badges Section */}
            <div className="px-6 sm:px-10 mb-10">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                    🏆 Szerzett Jelvények ({unlockedBadges.length}/{BADGES.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                    {BADGES.map((badge) => {
                        const unlocked = unlockedBadges.includes(badge.id);
                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.random() * 0.5 + 1.5 }}
                                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${unlocked
                                        ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                                        : 'bg-slate-50 border-slate-200 opacity-40 grayscale'
                                    }`}
                                title={badge.desc}
                            >
                                <div className="text-3xl mb-1">{badge.emoji}</div>
                                <div className="text-[10px] font-bold text-slate-600 leading-tight">{badge.name}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Unlocked Resources Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="px-6 sm:px-10 mb-10"
            >
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-400 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(99,102,241,0.4)] ring-4 ring-indigo-500/20 relative overflow-hidden transform transition-all hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <Unlock className="w-40 h-40 text-indigo-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-black text-indigo-900 text-xl mb-2 flex items-center gap-2">
                            <Unlock className="w-6 h-6 text-indigo-600" /> Feloldott Erőforrások
                        </h3>
                        <p className="text-indigo-700/80 text-sm mb-6">A kurzus sikeres teljesítésével az alábbi labor-hozzáféréseket szerezted meg:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <a href="#" className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-indigo-100/50 group flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Printer className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">Labor Gépfoglalás</h4>
                                <p className="text-xs text-slate-500">Jogosultság a Neptune 4 Max nyomtatók önálló lefoglalására.</p>
                            </a>
                            <a href="#" className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-indigo-100/50 group flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">Mester Kézikönyv</h4>
                                <p className="text-xs text-slate-500">Haladó Slicer profilok és beállítási segédletek letöltése.</p>
                            </a>
                            <a href="#" className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-indigo-100/50 group flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Link className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">Zárt Közösség</h4>
                                <p className="text-xs text-slate-500">Meghívó a labor belsős Discord/Teams csoportjába.</p>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Restart */}
            <div className="px-6 sm:px-10 pb-10 text-center">
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors border border-slate-200"
                >
                    <RotateCcw className="w-4 h-4" />
                    Újrakezdés
                </button>
            </div>
        </div>
    );
}
