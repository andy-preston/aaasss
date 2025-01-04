import type { Context } from "../../context/context.ts";
import { box, type Box } from "../../coupling/boxed-value.ts";
import { failure, type Failure } from "../../failure/failures.ts";
import type { LineWithRawSource } from "../../source-code/line-types.ts";
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

    const leftInIllegalState = (): Box<boolean> | Failure =>
        current == "javascript"
            ? failure(undefined, "js_jsMode", undefined)
            : box(false);

    const rendered = (line: LineWithRawSource) => {
        let itFailed = false;

        const failed = (failure: Failure) => {
            itFailed = true;
            line.withFailure(failure);
        };

        const actions = new Map([[
            "{{", () => {
                const alreadyInJs = leftInIllegalState();
                if (alreadyInJs.which == "failure") {
                    failed(alreadyInJs);
                } else {
                    current = "javascript";
                }
            }
        ], [
            "}}", () => {
                if (current == "assembler") {
                    failed(failure(undefined, "js_assemblerMode", undefined));
                } else {
                    const javascriptCode = buffer.javascript.join("\n").trim();
                    buffer.javascript = [];
                    const result = context.value(javascriptCode);
                    if (result.which == "failure") {
                        failed(result);
                    } else {
                        buffer.assembler.push(result.value);
                    }
                    current = "assembler";
                }
            }
        ]]);

        line.rawSource.split(scriptDelimiter).forEach(
            (part: string) => {
                if (actions.has(part)) {
                    actions.get(part)!();
                } else {
                    buffer[current]!.push(part);
                }
            }
        );

        const result = lineWithRenderedJavascript(
            line, itFailed ? "" : buffer.assembler.join("").trim()
        );
        buffer.assembler = [];
        return result;
    };

    return {
        "reset": reset,
        "leftInIllegalState": leftInIllegalState,
        "rendered": rendered
    }
};

export type Javascript = ReturnType<typeof javascript>;
