import { create } from 'zustand';

// Badge definitions
export const BADGES = [
    { id: 'assembler', name: 'Szerelőmester', emoji: '🔧', desc: 'Összeszerelés hiba nélkül', moduleId: 1 },
    { id: 'network', name: 'Hálózati Guru', emoji: '🌐', desc: 'Hálózat bekötés elsőre', moduleId: 2 },
    { id: 'precision', name: 'Precíziós Mérnök', emoji: '📐', desc: 'Szintezés tökéletesre', moduleId: 3 },
    { id: 'filament', name: 'Filament Varázsló', emoji: '🧵', desc: 'Filament betöltés hibátlanul', moduleId: 4 },
    { id: 'slicer', name: 'Slicer Ninja', emoji: '🍕', desc: 'G-Code szeletelés sikeres', moduleId: 5 },
    { id: 'babystep', name: 'Baby-step Hős', emoji: '👶', desc: 'Első nyomtatás hiba nélkül', moduleId: 6 },
    { id: 'master', name: '3D Nyomtatás Mester', emoji: '🏅', desc: 'Az egész kurzus teljesítve', moduleId: 7 },
] as const;

export type BadgeId = typeof BADGES[number]['id'];

interface AppState {
    currentStep: number;
    completedSteps: number[];
    failures: number;
    moduleFailures: Record<number, number>;
    totalScore: number;
    xp: number;
    level: string;
    unlockedBadges: BadgeId[];
    latestBadge: BadgeId | null; // For popup animation
    moduleStartTime: number | null;
    moduleTimes: Record<number, number>; // milliseconds per module
    startTime: number; // session start
    printerIP: string;
    telemetryLogs: { timestamp: number, event: string, data?: any }[];

    // Actions
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    completeCurrentStep: () => void;
    addFailure: (stepId?: number) => void;
    resetFailures: () => void;
    setPrinterIP: (ip: string) => void;
    logTelemetry: (event: string, data?: any) => void;
    startModuleTimer: () => void;
    dismissBadge: () => void;

    // Selectors
    getModuleStars: (moduleId: number) => number;
    getTotalTime: () => number;
}

function calculateLevel(xp: number): string {
    if (xp >= 1200) return 'Nagymester';
    if (xp >= 800) return 'Mester';
    if (xp >= 400) return 'Haladó';
    return 'Kezdő';
}

function calculateXPForModule(moduleId: number, failures: number): number {
    const base = 200;
    const penalty = failures * 30;
    return Math.max(50, base - penalty); // Minimum 50 XP
}

export const useAppStore = create<AppState>()((set, get) => ({
    currentStep: 1,
    completedSteps: [],
    failures: 0,
    moduleFailures: {},
    totalScore: 1000,
    xp: 0,
    level: 'Kezdő',
    unlockedBadges: [],
    latestBadge: null,
    moduleStartTime: Date.now(),
    moduleTimes: {},
    startTime: Date.now(),
    printerIP: '',
    telemetryLogs: [],

    setPrinterIP: (ip) => set({ printerIP: ip }),

    startModuleTimer: () => set({ moduleStartTime: Date.now() }),

    dismissBadge: () => set({ latestBadge: null }),

    getModuleStars: (moduleId: number) => {
        const state = get();
        if (!state.completedSteps.includes(moduleId)) return 0;
        const fails = state.moduleFailures[moduleId] || 0;
        if (fails === 0) return 3;
        if (fails <= 2) return 2;
        return 1;
    },

    getTotalTime: () => {
        return Date.now() - get().startTime;
    },

    logTelemetry: (event, data) => set((state) => {
        // Paraméterezett QR Kód: Olvassuk ki a printer_id-t az URL-ből, ha van!
        const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const printerId = urlParams.get('printer_id') || 'unknown_printer';

        const log = { timestamp: Date.now(), printerId, event, data };
        console.log(`[Telemetry][${printerId}] ${event}`, data || '');
        return { telemetryLogs: [...state.telemetryLogs, log] };
    }),

    nextStep: () => set((state) => {
        get().logTelemetry('NAVIGATE_NEXT', { from: state.currentStep, to: Math.min(state.currentStep + 1, 8) });
        return { currentStep: Math.min(state.currentStep + 1, 8), moduleStartTime: Date.now() };
    }),

    prevStep: () => set((state) => {
        get().logTelemetry('NAVIGATE_PREV', { from: state.currentStep, to: Math.max(state.currentStep - 1, 1) });
        return { currentStep: Math.max(state.currentStep - 1, 1), moduleStartTime: Date.now() };
    }),

    goToStep: (step) => set((state) => {
        get().logTelemetry('NAVIGATE_JUMP', { from: state.currentStep, to: step });
        return { currentStep: step, moduleStartTime: Date.now() };
    }),

    completeCurrentStep: () => set((state) => {
        const isNew = !state.completedSteps.includes(state.currentStep);
        if (!isNew) return {};

        const moduleFails = state.moduleFailures[state.currentStep] || 0;
        const earnedXP = calculateXPForModule(state.currentStep, moduleFails);
        const newXP = state.xp + earnedXP;
        const newLevel = calculateLevel(newXP);

        // Track module time
        const elapsed = state.moduleStartTime ? Date.now() - state.moduleStartTime : 0;
        const newModuleTimes = { ...state.moduleTimes, [state.currentStep]: elapsed };

        // Check badge unlock (badge earned if 0 failures for that module, or always for module 7)
        const badge = BADGES.find(b => b.moduleId === state.currentStep);
        let newBadges = [...state.unlockedBadges];
        let latestBadge: BadgeId | null = null;

        if (badge) {
            // Module 7 (harvest) always earn badge; others require 0 failures
            const earnsBadge = state.currentStep === 7 || moduleFails === 0;
            if (earnsBadge && !newBadges.includes(badge.id)) {
                newBadges.push(badge.id);
                latestBadge = badge.id;
            }
        }

        get().logTelemetry('MODULE_COMPLETED', {
            step: state.currentStep,
            score: state.totalScore,
            xpEarned: earnedXP,
            totalXP: newXP,
            level: newLevel,
            stars: moduleFails === 0 ? 3 : moduleFails <= 2 ? 2 : 1,
            badgeEarned: latestBadge,
            timeMs: elapsed,
        });

        return {
            completedSteps: [...state.completedSteps, state.currentStep],
            xp: newXP,
            level: newLevel,
            unlockedBadges: newBadges,
            latestBadge,
            moduleTimes: newModuleTimes,
        };
    }),

    addFailure: (stepId) => set((state) => {
        const targetStep = stepId || state.currentStep;
        const previousFails = state.moduleFailures[targetStep] || 0;

        get().logTelemetry('USER_FAILURE', { step: targetStep, totalFailsAtStep: previousFails + 1 });

        return {
            failures: state.failures + 1,
            moduleFailures: { ...state.moduleFailures, [targetStep]: previousFails + 1 },
            totalScore: Math.max(0, state.totalScore - 50)
        };
    }),

    resetFailures: () => set({ failures: 0 }),
}));
