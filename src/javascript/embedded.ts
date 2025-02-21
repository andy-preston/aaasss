import { emptyBox, failure, type Failure } from "../failure/failure-or-box.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";
import { JsExpression } from "./expression.ts";
import { lineWithRenderedJavascript } from "./line-types.ts";

const scriptDelimiter = /({{|}})/;

export const embeddedJs = (expression: JsExpression) => {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>,
    };

    type BufferName = keyof typeof buffer;

    let current: BufferName = "assembler";

    const resetState = () => {
        buffer.javascript = [];
        buffer.assembler = [];
        current = "assembler";
    };

    const leftInIllegalState = () => current == "javascript"
        ? failure(undefined, "js_jsMode", undefined)
        : emptyBox();

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
                    const result = expression(javascriptCode);
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
            line, itFailed ? "" : buffer.assembler.join("").trimEnd()
        );
        buffer.assembler = [];
        return result;
    };

    return {
        "resetState": resetState,
        "leftInIllegalState": leftInIllegalState,
        "rendered": rendered
    }
};

export type EmbeddedJs = ReturnType<typeof embeddedJs>;
