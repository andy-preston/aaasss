import type { PipelineStage } from "../assembler/data-types.ts";
import type { StringOrFailures } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Line } from "../line/line-types.ts";
import type { JsExpression } from "./expression.ts";

import { emptyBag } from "../assembler/bags.ts";
import { bagOfFailures, boringFailure } from "../failure/bags.ts";

const scriptDelimiter = /({{|}})/;

export const embeddedJs = (
    expression: JsExpression, currentLine: CurrentLine
): PipelineStage => {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>,
    };
    let current: keyof typeof buffer = "assembler";

    const stillInJsMode = (): StringOrFailures => current == "javascript"
        ? bagOfFailures([boringFailure("js_jsMode")])
        : emptyBag();

    const openMoustache = (line: Line) => {
        const alreadyInJs = stillInJsMode();
        if (alreadyInJs.type == "failures") {
            line.withFailures(alreadyInJs.it);
        } else {
            current = "javascript";
        }
    };

    const closeMoustache = (line: Line) => {
        if (current == "assembler") {
            line.withFailures([boringFailure("js_assemblerMode")]);
            return;
        }

        const javascriptCode = buffer.javascript.join("\n").trim();
        buffer.javascript = [];
        const result = expression(javascriptCode);
        if (result.type == "failures") {
            line.withFailures(result.it);
        } else {
            buffer.assembler.push(result.it);
        }
        current = "assembler";
    };

    const actions = new Map([
        ["{{", openMoustache], ["}}", closeMoustache]
    ]);

    const assemblerSource = (line: Line) => {
        line.rawSource.split(scriptDelimiter).forEach(part => {
            if (actions.has(part)) {
                actions.get(part)!(line);
            } else {
                buffer[current]!.push(part);
            }
        });
        const assembler = buffer.assembler.join("").trimEnd();
        buffer.assembler = [];
        return assembler;
    }

    const pipeline = (line: Line) => {
        currentLine.forDirectives(line);
        line.assemblySource = assemblerSource(line);
        if (line.lastLine) {
            const check = stillInJsMode();
            if (check.type == "failures") {
                line.withFailures(check.it);
            }
        }
    };

    return pipeline;
};
