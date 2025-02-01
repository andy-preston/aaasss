export const passes = [1, 2] as const;

export type PassNumber = typeof passes[number];

type ResetStateCallback = () => void;

export const pass = () => {
    const resetCallbacks: Array<ResetStateCallback> = [];
    let current: PassNumber;

    const addResetStateCallback = (callback: ResetStateCallback) => {
        resetCallbacks.push(callback);
    };

    const start = (pass: PassNumber) => {
        current = pass;
        if (pass == 2) {
            resetCallbacks.forEach(resetCallback => resetCallback());
        }
    };

    return {
        "addResetStateCallback": addResetStateCallback,
        "public": {
            "start": start,
            "ignoreErrors": () => current == 1,
            "produceOutput": () => current == 2
        },
    };
};

export type Pass = ReturnType<typeof pass>["public"];
