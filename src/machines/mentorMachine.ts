import { setup, assign } from 'xstate';

export const mentorMachine = setup({
    types: {
        context: {} as {
            failureCount: number;
            lastTopic: string;
            currentMessage: string;
        },
        events: {} as
            | { type: 'IDLE_TIMEOUT' }
            | { type: 'ASK_HELP'; topic: string }
            | { type: 'USER_FAILED'; topic: string }
            | { type: 'STEP_SUCCESS' }
            | { type: 'DISMISS' }
            | { type: 'RESET' },
    },
    actions: {
        incrementFailure: assign({
            failureCount: ({ context }) => context.failureCount + 1,
        }),
        setTopic: assign({
            lastTopic: ({ event }) => (event.type === 'USER_FAILED' || event.type === 'ASK_HELP') ? event.topic : 'general',
        }),
        clearFailures: assign({
            failureCount: 0,
        }),
        setMessage: assign({
            currentMessage: ({ event, context }) => {
                if (event.type === 'STEP_SUCCESS') return "Szép munka! Jöhet a következő lépés.";
                if (event.type === 'IDLE_TIMEOUT') return "Már egy ideje nem léptél semmit. Elakadtál valahol?";
                if (event.type === 'USER_FAILED') {
                    if (context.failureCount >= 2) return "Látom, többször is nekifutottál. Nézzük meg együtt: a formája vagy a színe nem stimmelhet?";
                    return "Nem egészen! Próbáld újra, figyelj a részletekre.";
                }
                if (event.type === 'ASK_HELP') {
                    const topic = event.topic;
                    if (topic === 'cable') return "Először a szalagkábelt kell a kijelzőhöz kötni! Utána választhatsz WiFi vagy Ethernet (LAN) kapcsolatot. A WiFi kényelmesebb, a LAN stabilabb – mindkettő tökéletes!";
                    if (topic === 'fluidd') return "Az IP címet pontosan úgy írd be a böngészőbe, ahogy a nyomtató mutatta. Semmi extra karakter!";
                    if (topic === 'leveling') return "A papír tesztnél a súrlódás a kulcs. Ha túl laza, még tekerj rajta a gombokon vagy a Z-Offseten!";
                    if (topic === 'filament') return "A PLA hidegen nem mozdul. Biztosan felfűtötted 200°C-ra a fejet, mielőtt tolni kezdted?";
                    if (topic === 'slicer') return "A szeletelőben a rétegek a lényeg. Sikerült importálni a modellt? Húzd rá a sárga asztalra!";
                    if (topic === 'first_layer_memory') return "Emlékszel, amikor a papírlappal állítottuk a távolságot? Most is hasonlóan finoman kell korrigálnod a fejet a mínusz gombokkal (Baby-stepping), nehogy felszakadjon a réteg!";
                    if (topic === 'first_layer') return "Figyeld, hogy tapad a szál! Ha a levegőben 'foszlik', akkor vidd közelebb a fejet a mínusz gombokkal (Baby-stepping)!";
                    if (topic === 'harvest') return "A PEI lap nagyszerű találmány! Várj amíg 40 fok alá hűl, vedd le, majd bátran hajlítsd meg mindkét irányba!";
                    return "Miben segíthetek?";
                }
                return "Szia! Printi vagyok.";
            }
        }),
    },
}).createMachine({
    id: 'smartMentor',
    initial: 'hidden',
    context: {
        failureCount: 0,
        lastTopic: 'general',
        currentMessage: "Szia! Printi vagyok, a mentorod.",
    },
    states: {
        hidden: {
            on: {
                IDLE_TIMEOUT: {
                    target: 'active',
                    actions: ['setMessage']
                },
                ASK_HELP: {
                    target: 'active',
                    actions: ['setTopic', 'setMessage']
                },
                USER_FAILED: {
                    actions: ['incrementFailure', 'setTopic'],
                    target: 'evaluatingFailure'
                },
                STEP_SUCCESS: {
                    target: 'celebrating',
                    actions: ['clearFailures', 'setMessage']
                }
            }
        },
        evaluatingFailure: {
            always: [
                {
                    guard: ({ context }) => context.failureCount >= 2,
                    target: 'proactiveIntervention',
                    actions: ['setMessage']
                },
                {
                    target: 'hidden' // Kept hidden on first failure to not be annoying
                }
            ]
        },
        active: {
            on: {
                DISMISS: 'hidden',
                USER_FAILED: {
                    actions: ['incrementFailure', 'setTopic', 'setMessage']
                },
                STEP_SUCCESS: {
                    target: 'celebrating',
                    actions: ['clearFailures', 'setMessage']
                },
                ASK_HELP: {
                    actions: ['setTopic', 'setMessage']
                }
            }
        },
        proactiveIntervention: {
            on: {
                DISMISS: 'hidden',
                STEP_SUCCESS: {
                    target: 'celebrating',
                    actions: ['clearFailures', 'setMessage']
                }
            }
        },
        celebrating: {
            after: {
                5000: 'hidden' // Auto hide after 5 seconds of celebration
            },
            on: {
                DISMISS: 'hidden'
            }
        }
    }
});
