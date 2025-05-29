import type { PipelineStage } from "../assembler/data-types.ts";
import type { Line } from "../line/line-types.ts";
import type { JsExpression } from "./expression.ts";

import { boringFailure } from "../failure/bags.ts";

const scriptDelimiter = /({{|}})/;

export const embeddedJs = (expression: JsExpression): PipelineStage => {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>,
    };
    let current: keyof typeof buffer = "assembler";

    const failIfInJsMode = (line: Line): boolean => {
        const fail = current == "javascript";
        if (fail) {
            line.failures.push(boringFailure("js_jsMode"));
        }
        return fail;
    };

    const openMoustache = (line: Line) => {
        if (!failIfInJsMode(line)) {
            current = "javascript";
        }
    };

    const closeMoustache = (line: Line) => {
        if (current == "assembler") {
            line.failures.push(boringFailure("js_assemblerMode"));
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

    const plainJsLine = (line: Line) => {
        if (line.lineNumber == 1) {
            openMoustache(line);
        }
        buffer.javascript.push(line.rawSource);
        if (line.eof) {
            closeMoustache(line);
        }
    }

    const mixedLine = (line: Line) => {
        line.rawSource.split(scriptDelimiter).forEach(part => {
            if (actions.has(part)) {
                actions.get(part)!(line);
            } else {
                buffer[current]!.push(part);
            }
        });
    };

    const pipeline = (line: Line) => {
        if (line.fileName.endsWith(".js")) {
            plainJsLine(line);
        } else {
            mixedLine(line);
        }
        line.assemblySource = buffer.assembler.join("").trimEnd();
        buffer.assembler = [];
        if (line.lastLine) {
            failIfInJsMode(line);
        }
    };

    return pipeline;
};
