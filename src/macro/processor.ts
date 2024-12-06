import { box, failure, type Box, type Failure } from "../coupling/value-failure.ts";
import {
    assemblyLine, rawLine, tokenisedLine, type TokenisedLine
} from "../coupling/line.ts";
import { macro, Macro } from "./macro.ts";

export const processor = () => {
    let currentMacro: Macro | undefined;

    const macros: Array<Macro> = [];

    const illegalState = (): Array<Failure> =>
        currentMacro != undefined
            ? [failure(undefined, "macro.define", undefined)]
            : [];

    const defineDirective = (
        name: string,
        parameters?: Array<string>
    ): Box<string> | Failure => {
        if (currentMacro != undefined) {
            return failure(undefined, "macro.define", undefined);
        }
        currentMacro = macro(name, parameters == undefined ? [] : parameters);
        return box(name);
    };

    const endDirective = (): Box<string> | Failure => {
        if (currentMacro == undefined) {
            return failure(undefined, "macro.end", undefined);
        }
        macros.push(currentMacro);
        const name = currentMacro.name;
        currentMacro = undefined;
        return box(name);
    };

    const saveLine = (line: TokenisedLine) => {
        currentMacro!.saveLine(line);
    };

    const defining = () => currentMacro != undefined;

    return {
        "illegalState": illegalState,
        "defineDirective": defineDirective,
        "endDirective": endDirective,
        "defining": defining,
        "macroDirective": null,
        "saveLine": saveLine,
        "nextLine": () => [tokenisedLine(assemblyLine(rawLine("", 0, "", []), "", []), "", "", [], [])]
    };
};

export type MacroProcessor = ReturnType<typeof processor>;
