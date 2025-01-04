import type { Box } from "../coupling/boxed-value.ts";
import type { Failure } from "./failures.ts";

type IllegalStateCallback = () => Box<boolean> | Failure;

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
