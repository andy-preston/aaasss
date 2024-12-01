export const passes = [1, 2] as const;

type PassNumber = typeof passes[number];

type ResetStateCallback = () => void;

export const newPass = (resetCallbacks: Array<ResetStateCallback>) => {
    let current: PassNumber;

    const start = (pass: PassNumber) => {
        current = pass;
        if (pass == 2) {
            resetCallbacks.forEach(resetCallback => resetCallback());
        }
    };

    const showErrors = () => current == 2;

    const ignoreErrors = () => current == 1;

    return {
        "start": start,
        "ignoreErrors": ignoreErrors,
        "showErrors": showErrors,
    };
};

export type Pass = ReturnType<typeof newPass>;
