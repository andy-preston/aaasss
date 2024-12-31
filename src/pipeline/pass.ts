export const passes = [1, 2] as const;

type PassNumber = typeof passes[number];

type ResetStateCallback = () => void;

export const pass = (resetCallbacks: Array<ResetStateCallback>) => {
    let current: PassNumber;

    const start = (pass: PassNumber) => {
        current = pass;
        if (pass == 2) {
            resetCallbacks.forEach(resetCallback => resetCallback());
        }
    };

    return {
        "start": start,
        "ignoreErrors": () => current == 1,
        "produceOutput": () => current == 2,
    };
};

export type Pass = ReturnType<typeof pass>;
