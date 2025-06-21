import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { JsExpression } from "./expression.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure } from "../failure/bags.ts";

const scriptDelimiter = /({{|}})/;

export const embeddedJs = (
    currentLine: CurrentLine, expression: JsExpression
) => {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>,
    };
    let current: keyof typeof buffer = "assembler";

    const failIfInJsMode = (): boolean => {
        const fail = current == "javascript";
        if (fail) {
            addFailure(currentLine().failures, boringFailure(
                "js_jsMode"
            ));
        }
        return fail;
    };

    const openMoustache = () => {
        if (!failIfInJsMode()) {
            current = "javascript";
        }
    };

    const closeMoustache = () => {
        if (current == "assembler") {
            addFailure(currentLine().failures, boringFailure(
                "js_assemblerMode"
            ));
            return;
        }

        const javascriptCode = buffer.javascript.join("\n").trim();
        buffer.javascript = [];
        buffer.assembler.push(expression(javascriptCode));
        current = "assembler";
    };

    const actions = new Map([
        ["{{", openMoustache], ["}}", closeMoustache]
    ]);

    const plainJsLine = () => {
        if (currentLine().lineNumber == 1) {
            openMoustache();
        }
        buffer.javascript.push(currentLine().rawSource);
        if (currentLine().eof) {
            closeMoustache();
        }
    }

    const mixedLine = () => {
        currentLine().rawSource.split(scriptDelimiter).forEach(part => {
            if (actions.has(part)) {
                const moustache = actions.get(part)!;
                moustache();
            } else {
                buffer[current]!.push(part);
            }
        });
    };

    const pipeline: PipelineProcess = () => {
        if (currentLine().fileName.endsWith(".js")) {
            plainJsLine();
        } else {
            mixedLine();
        }
        currentLine().assemblySource = buffer.assembler.join("").trimEnd();
        buffer.assembler = [];
    }

    const reset: PipelineReset = () => failIfInJsMode();

    return {
        "pipeline": pipeline,
        "reset": reset
    };
};

export type EmbeddedJs = ReturnType<typeof embeddedJs>;
