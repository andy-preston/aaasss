import { Failure, Failures } from "./failures.ts";

type IllegalStateCallback = () => Array<Failure>;

export const illegalStateFailures = (callbacks: Array<IllegalStateCallback>) =>
    () => callbacks.reduce(
        (failures, callback) => failures.concat(callback()),
        [] as Failures
    );

export type IllegalState = ReturnType<typeof illegalStateFailures>;
