import type { Box, Failure } from "../failure/failure-or-box.ts";
import { LineWithFailures } from "./line-types.ts";

export type IllegalStateCallback = () => Box<undefined> | Failure;

export const illegalStateFailures = () => {
    const callbacks: Array<IllegalStateCallback> = [];

    const useCallback = (callback: IllegalStateCallback) => {
        callbacks.push(callback);
    }

    const check = (line: LineWithFailures) => {
        callbacks.forEach((callback) => {
            const state = callback();
            if (state.which == "failure") {
                line.withFailure(state);
            }
        });
    };

    return {
        "useCallback": useCallback,
        "check": check
    }
};

export type IllegalState = ReturnType<typeof illegalStateFailures>;
