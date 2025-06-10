import { Failure } from "../failure/bags.ts";
import type { Line } from "./line-types.ts";

export const currentLine = () => {
    let theLine: Line | undefined;

    const forDirectives = (line: Line) => {
        theLine = line;
    };

    const directiveBackdoor = () => theLine!;

    const failure = (failure: Failure) => {
        theLine!.failures.push(failure);
    };

    const failures = (failures: Array<Failure>) => {
        failures.forEach(failure);
    };

    return {
        "directiveBackdoor": directiveBackdoor,
        "failure": failure,
        "failures": failures,
        "forDirectives": forDirectives
    };
};

export type CurrentLine = ReturnType<typeof currentLine>;
