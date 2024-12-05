import { Failure } from "../coupling/value-failure.ts";

type IllegalState = () => Array<Failure>;

type Output = (failures: Array<Failure>) => void;

export const illegalState = (
    callbacks: Array<IllegalState>,
    output: Output
) => () => callbacks.forEach(callback => output(callback()));
