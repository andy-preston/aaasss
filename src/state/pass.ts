export const passes = [1, 2] as const;

type PassNumber = typeof passes[number];

type ResetStateCallback = () => void;

export const newPass = (resetStateCallback: ResetStateCallback) => {
    let current: PassNumber;

    const start = (pass: PassNumber) => {
        current = pass;
        resetStateCallback();
    };

    const showErrors = () => current == 2;

    const ignoreErrors = () => current == 1;

    return {
        "start": start,
        "ignoreErrors": ignoreErrors,
        "showErrors": showErrors
    };
};

export type Pass = ReturnType<typeof newPass>;
