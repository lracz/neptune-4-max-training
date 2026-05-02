import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, X, Bot } from 'lucide-react';
import { useIdle } from 'react-use';
import { useMachine } from '@xstate/react';
import { mentorMachine } from '../machines/mentorMachine';
import { useAppStore } from '../store/appStore';

interface Message {
    id: string;
    sender: 'tutor' | 'user';
    text: string;
}

export default function SmartMentor() {
    const isIdle = useIdle(30000); // Trigger after 30s instead of 60s for easier testing
    const [state, send] = useMachine(mentorMachine);
    const { currentStep } = useAppStore();

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'tutor', text: "Szia! Printi vagyok, a mentorod. Ha elakadsz, szólj bátran!" }
    ]);
    const [input, setInput] = useState('');
    const chatScrollRef = useRef<HTMLDivElement>(null);

    const isOpen = state.value !== 'hidden';

    // Watch Idle state
    useEffect(() => {
        if (isIdle && !isOpen) {
            send({ type: 'IDLE_TIMEOUT' });
        }
    }, [isIdle, isOpen, send]);

    // When state messages update, add it to chat history
    useEffect(() => {
        if (state.context.currentMessage) {
            // Don't duplicate if it's the exact same message as the last one
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.text === state.context.currentMessage && lastMsg.sender === 'tutor') {
                return;
            }
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), sender: 'tutor', text: state.context.currentMessage }
            ]);
        }
    }, [state.context.currentMessage]);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Determine topic heuristically
        const l = input.toLowerCase();
        let topic = 'general';
        if (l.includes('kábel') || currentStep === 1) topic = 'cable';
        if (l.includes('ip') || l.includes('böngésző') || currentStep === 2) topic = 'fluidd';
        if (l.includes('papír') || l.includes('szintez') || l.includes('z-offset') || currentStep === 3) topic = 'leveling';
        if (l.includes('filament') || l.includes('fűt') || l.includes('pla') || currentStep === 4) topic = 'filament';
        if (l.includes('slicer') || l.includes('cura') || l.includes('szelet') || l.includes('gcode') || currentStep === 5) topic = 'slicer';
        if (l.includes('tapad') || l.includes('baby') || l.includes('első réteg') || currentStep === 6) {
            topic = 'first_layer';
            // Session Memory: if they struggled with leveling (module 3), customize the response
            const levelingFails = useAppStore.getState().moduleFailures[3] || 0;
            if (levelingFails >= 2) {
                topic = 'first_layer_memory'; // triggers special message
            }
        }
        if (l.includes('hűl') || l.includes('pei') || l.includes('hajlít') || currentStep === 7) topic = 'harvest';

        setTimeout(() => {
            send({ type: 'ASK_HELP', topic });
        }, 600);
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => send({ type: 'ASK_HELP', topic: 'general' })}
                        className="fixed bottom-6 right-6 p-4 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-full shadow-xl flex items-center gap-2 transition-colors z-50 group cursor-pointer"
                    >
                        <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span className="font-semibold px-1">Elakadtam</span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-50 h-[500px]"
                    >
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-400 p-4 text-white flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full relative">
                                    <Bot className="w-6 h-6 shrink-0" />
                                    {state.matches('proactiveIntervention') && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Printi Mentor</h3>
                                    <p className="text-white/80 text-xs">AI Asszisztens</p>
                                </div>
                            </div>
                            <button
                                onClick={() => send({ type: 'DISMISS' })}
                                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div
                            ref={chatScrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth"
                        >
                            {messages.map(msg => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${msg.sender === 'user'
                                        ? 'bg-teal-500 text-white rounded-br-none'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-3 bg-white border-t border-slate-100">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Kérdezz rá a probléma okára..."
                                    className="w-full bg-slate-100/50 border border-slate-200 text-sm rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 p-1.5 text-teal-600 hover:bg-teal-50 rounded-full disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-default"
                                >
                                    <MessageCircleQuestion className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
