import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Confetti from 'react-confetti';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ItemTypes = {
    CABLE: 'cable',
};

function DraggableCable({ isConnected }: { isConnected: boolean }) {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: ItemTypes.CABLE,
        item: { id: 'lan-cable' },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), []);

    if (isConnected) return null;

    return (
        <motion.div
            ref={dragRef as unknown as React.Ref<HTMLDivElement>}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="absolute bottom-10 left-10 cursor-grab active:cursor-grabbing flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
        >
            <div className="w-12 h-16 bg-blue-500 rounded-md border-b-8 border-blue-700 shadow-xl relative flex justify-center items-start">
                <div className="w-4 h-4 bg-yellow-400 absolute -top-4 rounded-t-sm" />
                <div className="w-2 h-10 bg-blue-300 absolute -bottom-10" />
            </div>
            <p className="mt-12 text-sm font-semibold text-slate-600 bg-white/80 px-2 rounded-full shadow-sm">LAN Kábel</p>
        </motion.div>
    );
}

function DropZone({ onDrop, isConnected }: { onDrop: () => void, isConnected: boolean }) {
    const [{ isOver }, dropRef] = useDrop(() => ({
        accept: ItemTypes.CABLE,
        drop: () => onDrop(),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), []);

    return (
        <div className="relative">
            <div className="w-64 h-48 bg-slate-800 rounded-xl shadow-inner border-4 border-slate-700 p-6 flex flex-col items-center justify-between">
                <div className="text-slate-400 font-mono text-xs mb-2">NEPTUNE 4 MAX HÁTLAP</div>

                <div className="flex gap-8 justify-center items-center w-full">
                    {/* Wrong Port: USB */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-8 bg-black rounded-sm border-2 border-slate-600 flex justify-center items-center relative">
                            <div className="w-10 h-2 bg-slate-800" />
                        </div>
                        <span className="text-slate-500 text-xs font-mono">USB</span>
                    </div>

                    {/* Correct Port: RJ45 */}
                    <div className="flex flex-col items-center gap-2">
                        <div
                            ref={dropRef as unknown as React.Ref<HTMLDivElement>}
                            className={`w-14 h-14 rounded-md border-2 transition-colors flex justify-center items-end pb-1 relative
                ${isOver ? 'bg-teal-900/50 border-teal-400' : 'bg-black border-slate-600'}
                ${isConnected ? 'border-teal-400 bg-teal-900/20' : ''}`}
                        >
                            {isConnected && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="w-10 h-14 bg-blue-500 rounded-sm border-b-4 border-blue-700 absolute -bottom-4 z-10"
                                >
                                    <div className="w-4 h-3 bg-yellow-400 mx-auto rounded-t-sm" />
                                    <div className="w-2 h-16 bg-blue-300 mx-auto mt-1" />
                                </motion.div>
                            )}
                        </div>
                        <span className="text-slate-500 text-xs font-mono">LAN / RJ45</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TroubleshootingMinigame({ onComplete }: { onComplete: () => void }) {
    const [isFixed, setIsFixed] = useState(false);

    const handleFix = () => {
        setIsFixed(true);
        onComplete();
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-2xl ${isFixed ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isFixed ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">1. Feladat: Hálózati Kapcsolat</h2>
                            <p className="text-slate-500">
                                {isFixed
                                    ? "Szuper! A kábel a megfelelő helyre került."
                                    : "Valaki rossz helyre próbálta dugni a hálózati kábelt. Húzd a megfelelő portba!"}
                            </p>
                        </div>
                    </div>

                    <div className="relative bg-slate-50 rounded-2xl p-8 min-h-[400px] flex items-center justify-center border-2 border-dashed border-slate-200">
                        {isFixed && <Confetti width={800} height={500} recycle={false} numberOfPieces={300} />}

                        <DropZone onDrop={handleFix} isConnected={isFixed} />
                        <DraggableCable isConnected={isFixed} />

                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
