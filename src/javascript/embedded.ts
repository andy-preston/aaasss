import { emptyBag } from "../assembler/bags.ts";
import { saveGlobalLineForDirectives } from "../directives/global-line.ts";
import { failure, bagOfFailures, StringOrFailures } from "../failure/bags.ts";
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

    const leftInIllegalState = (): StringOrFailures => current == "javascript"
        ? bagOfFailures([failure(undefined, "js_jsMode", undefined)])
        : emptyBag();

    const rendered = (line: LineWithRawSource) => {
        saveGlobalLineForDirectives(line);

        let itFailed = false;

        const actions = new Map([[
            "{{", () => {
                const alreadyInJs = leftInIllegalState();
                if (alreadyInJs.type == "failures") {
                    itFailed = true;
                    line.withFailures(alreadyInJs.it);
                } else {
                    current = "javascript";
                }
            }
        ], [
            "}}", () => {
                if (current == "assembler") {
                    itFailed = true;
                    line.withFailure(failure(undefined, "js_assemblerMode", undefined));
                } else {
                    const javascriptCode = buffer.javascript.join("\n").trim();
                    buffer.javascript = [];
                    const result = expression(javascriptCode);
                    if (result.type == "failures") {
                        itFailed = true;
                        line.withFailures(result.it);
                    } else {
                        buffer.assembler.push(result.it);
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
