import type { Context } from "../context/context.ts";
import { failure, type Failure } from "../failure.ts";
import {
assemblyFailures,
    assemblyLine, type AssemblyLine, type RawLine
} from "./line.ts";

const scriptDelimiter = /({{|}})/;

export const javascript = (context: Context) => {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>
    };

    type BufferName = keyof typeof buffer;

    let current: BufferName = "assembler";

    const javascript = (failures: Array<Failure>): Array<Failure> => {
        if (current == "javascript") {
            failures.push(failure(undefined, "jsMode", undefined));
        } else {
            current = "javascript";
        }
        return failures;
    };

    const assembler = (failures: Array<Failure>): Array<Failure> => {
        if (current == "assembler") {
            failures.push(failure(undefined, "assemblerMode", undefined));
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

    return (line: RawLine): AssemblyLine => {
        const failures = line.rawSource.split(scriptDelimiter).reduce(usePart, []);
        if (failures.length > 0) {
            return assemblyFailures(line, failures);
        }
        const assembler = buffer.assembler.join("").trim();
        buffer.assembler = [];
        return assemblyLine(line, assembler);
    };
};
