import { Failure } from "../value-or-failure.ts";

type IllegalState = () => Array<Failure>;

type Output = (failures: Array<Failure>) => void;

export const illegalState = (
    callbacks: Array<IllegalState>,
    output: Output
) => () => callbacks.forEach(callback => output(callback()));
