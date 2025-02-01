export const passes = [1, 2] as const;

export type PassNumber = typeof passes[number];

type ResetStateCallback = () => void;

export const pass = () => {
    const resetCallbacks: Array<ResetStateCallback> = [];
    let current: PassNumber = 1;

    const addResetStateCallback = (callback: ResetStateCallback) => {
        resetCallbacks.push(callback);
    };

    const second = () => {
        current = 2;
        resetCallbacks.forEach(resetCallback => resetCallback());
    };

    return {
        "addResetStateCallback": addResetStateCallback,
        "second": second,
        "ignoreErrors": () => current == 1,
        "produceOutput": () => current == 2
    };
};

export type Pass = ReturnType<typeof pass>;
