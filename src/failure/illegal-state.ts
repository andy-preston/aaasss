import type { StringOrFailures } from "./bags.ts";
import { LineWithFailures } from "./line-types.ts";

export type IllegalStateCallback = () => StringOrFailures;

export const illegalStateFailures = () => {
    const callbacks: Array<IllegalStateCallback> = [];

    const useCallback = (callback: IllegalStateCallback) => {
        callbacks.push(callback);
    }

    const check = (line: LineWithFailures) => {
        callbacks.forEach((callback) => {
            const state = callback();
            if (state.type == "failures") {
                line.withFailures(state.it);
            }
        });
    };

    return {
        "useCallback": useCallback,
        "check": check
    }
};

export type IllegalState = ReturnType<typeof illegalStateFailures>;
