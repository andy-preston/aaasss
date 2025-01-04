import type { Context } from "../context/context.ts";
import { failure, type Failure } from "../failure/failures.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";
import { lineWithRenderedJavascript } from "./line-types.ts";

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

    const leftInIllegalState = (): Array<Failure> =>
        current == "javascript"
            ? [failure(undefined, "js_jsMode", undefined)]
            : [];

    const javascript = (failures: Array<Failure>): Array<Failure> => {
        const alreadyInJs = leftInIllegalState();
        if (alreadyInJs.length > 0) {
            return failures.concat(alreadyInJs);
        } else {
            current = "javascript";
            return failures;
        }
    };

    const assembler = (failures: Array<Failure>): Array<Failure> => {
        if (current == "assembler") {
            failures.push(failure(undefined, "js_assemblerMode", undefined));
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

    const usePart = (
        failures: Array<Failure>, part: string
    ): Array<Failure> => {
        if (part == "{{") {
            return javascript(failures);
        }
        if (part == "}}") {
            return assembler(failures);
        }
        buffer[current]!.push(part);
        return failures;
    };

    const rendered = (line: LineWithRawSource) => {
        const failures = line.rawSource.split(scriptDelimiter).reduce(
            usePart,
            [],
        );
        if (failures.length > 0) {
            const newLine = lineWithRenderedJavascript(line, "");
            newLine.addFailures(failures);
            return newLine;
        }
        const assembler = buffer.assembler.join("").trim();
        buffer.assembler = [];
        return lineWithRenderedJavascript(line, assembler);
    };

    return {
        "reset": reset,
        "leftInIllegalState": leftInIllegalState,
        "rendered": rendered
    }
};

export type Javascript = ReturnType<typeof javascript>;
