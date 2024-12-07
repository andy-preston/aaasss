import { failure, type Failure } from "../coupling/value-failure.ts";
import {
    assemblyLine, type AssemblyLine, type RawLine
} from "../line-types/lines.ts";
import type { Context } from "../context/context.ts";

const scriptDelimiter = /({{|}})/;

export const javascript = (context: Context) => {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>,
    };

    type BufferName = keyof typeof buffer;

    let current: BufferName = "assembler";

    const reset = () => {
        buffer.javascript = [];
        buffer.assembler = [];
        current = "assembler";
    };

    const illegalState = (): Array<Failure> =>
        current == "javascript"
            ? [failure(undefined, "js.jsMode", undefined)]
            : [];

    const javascript = (failures: Array<Failure>): Array<Failure> => {
        const alreadyInJs = illegalState();
        if (alreadyInJs.length > 0) {
            return failures.concat(alreadyInJs);
        } else {
            current = "javascript";
            return failures;
        }
    };

    const assembler = (failures: Array<Failure>): Array<Failure> => {
        if (current == "assembler") {
            failures.push(failure(undefined, "js.assemblerMode", undefined));
        } else {
            const javascript = buffer.javascript.join("\n").trim();
            buffer.javascript = [];
            const jsResult = context.value(javascript);
            if (jsResult.which == "failure") {
                failures.push(jsResult);
            } else {
                buffer.assembler.push(jsResult.value);
            }
            current = "assembler";
        }
        return failures;
    };

    const usePart = (failures: Array<Failure>, part: string): Array<Failure> => {
        if (part == "{{") {
            return javascript(failures);
        }
        if (part == "}}") {
            return assembler(failures);
        }
        buffer[current]!.push(part);
        return failures;
    };

    const assembly = (line: RawLine): AssemblyLine => {
        const failures = line.rawSource.split(scriptDelimiter).reduce(
            usePart,
            [],
        );
        if (failures.length > 0) {
            return assemblyLine(line, "", failures);
        }
        const assembler = buffer.assembler.join("").trim();
        buffer.assembler = [];
        return assemblyLine(line, assembler, []);
    };

    return {
        "reset": reset,
        "illegalState": illegalState,
        "assembly": assembly
    }
};

export type Javascript = ReturnType<typeof javascript>;
