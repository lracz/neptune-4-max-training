import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Lightbulb } from 'lucide-react';

interface TroubleshootingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ISSUES = [
    {
        id: 'spaghetti',
        title: 'Spagetti-szörny (Adhesion Failure)',
        image: '/images/modul_trouble_spaghetti.png',
        symptoms: 'A nyomtatott tárgy helyett egy nagy, kusza műanyagkupac (spagetti) van az asztalon.',
        cause: 'A nyomtatás közben a tárgy levált a PEI lapról, de a gép tovább nyomtatott a levegőbe.',
        solution: 'Állítsd le a gépet! Tisztítsd le a PEI lapot IPA-val. Ellenőrizd a Z-offsetet (lehet, hogy túl magas), és fontold meg a "Brim" (perem) bekapcsolását a Slicerben.'
    },
    {
        id: 'warping',
        title: 'Felkunkorodás (Warping)',
        image: '/images/modul_trouble_warp.png',
        symptoms: 'A nyomtatott tárgy sarkai felemelkednek, elválnak az asztaltól, a modell deformálódik.',
        cause: 'A műanyag túl gyorsan vagy egyenetlenül hűlt le, ami zsugorodást okozott a sarkoknál.',
        solution: 'Emeld meg az asztal hőmérsékletét 5-10 fokkal. Zárd be a labor ablakát (huzat). Használj Brim-et a jobb tapadásért.'
    },
    {
        id: 'clog',
        title: 'Dugulás (Clogged Nozzle)',
        image: '/images/modul_trouble_clog.png',
        symptoms: 'Az extruder hangosan kattog (ugrik a fogaskerék), és nem jön műanyag a fúvókából.',
        cause: 'Szennyeződés vagy megégett filament ragadt a fúvóka (nozzle) belsejébe.',
        solution: 'Melegítsd fel a fúvókát a filament maximális hőfokára (pl. 230°C PLA-nál), és használd a géphez kapott tisztítótűt. Ha nem segít, "Cold Pull" technikát kell alkalmazni.'
    }
];

export default function TroubleshootingModal({ isOpen, onClose }: TroubleshootingModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
                >
                    {/* Header */}
                    <div className="bg-red-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-200" />
                            <h2 className="text-xl font-bold">Hibaelhárítási Kézikönyv</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-red-700 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                        <p className="text-slate-600 mb-6 font-medium">
                            Ha valami balul sül el a nyomtatás során, ne ess pánikba! Ez a 3 leggyakoribb hiba, amivel találkozhatsz:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {ISSUES.map((issue) => (
                                <div key={issue.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                    <div className="h-48 bg-slate-200 relative">
                                        <img 
                                            src={issue.image} 
                                            alt={issue.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/1e293b/94a3b8?text=Hiba' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <h3 className="absolute bottom-4 left-4 right-4 text-white font-bold text-lg leading-tight">
                                            {issue.title}
                                        </h3>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col gap-4">
                                        <div>
                                            <div className="text-xs uppercase font-bold text-red-500 mb-1 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Tünetek
                                            </div>
                                            <p className="text-sm text-slate-700">{issue.symptoms}</p>
                                        </div>
                                        <div>
                                            <div className="text-xs uppercase font-bold text-orange-500 mb-1">Okok</div>
                                            <p className="text-sm text-slate-600">{issue.cause}</p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-slate-100">
                                            <div className="text-xs uppercase font-bold text-teal-600 mb-1 flex items-center gap-1">
                                                <Lightbulb className="w-3 h-3" /> Megoldás
                                            </div>
                                            <p className="text-sm font-medium text-slate-800">{issue.solution}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
