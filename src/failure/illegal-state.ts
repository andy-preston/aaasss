import type { Box, Failure } from "../failure/failure-or-box.ts";

type IllegalStateCallback = () => Box<undefined> | Failure;

export const illegalStateFailures = (
    callbacks: Array<IllegalStateCallback>
) => (
    addFailures: (failures: Failure) => unknown
) => callbacks.forEach((callback) => {
    const state = callback();
    if (state.which == "failure") {
        addFailures(state);
    }
});

export type IllegalState = ReturnType<typeof illegalStateFailures>;
