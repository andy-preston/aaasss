import type { ImmutableLine } from "../assembler/line.ts";
import type { StringOrFailures } from "../failure/bags.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { JsExpression } from "./expression.ts";

import { emptyBag } from "../assembler/bags.ts";
import { bagOfFailures, boringFailure } from "../failure/bags.ts";
import { lineWithRenderedJavascript } from "./line-types.ts";

const scriptDelimiter = /({{|}})/;

export const assemblyPipeline = (
    expression: JsExpression, symbolTable: SymbolTable
) => function* (
    lines: IterableIterator<ImmutableLine>
) {
    const buffer = {
        "javascript": [] as Array<string>,
        "assembler": [] as Array<string>,
    };
    let current: keyof typeof buffer = "assembler";

    const stillInJsMode = (): StringOrFailures => current == "javascript"
        ? bagOfFailures([boringFailure("js_jsMode")])
        : emptyBag();

    const openMoustache = (line: LineWithRawSource) => {
        const alreadyInJs = stillInJsMode();
        if (alreadyInJs.type == "failures") {
            line.withFailures(alreadyInJs.it);
        } else {
            current = "javascript";
        }
    };

    const closeMoustache = (line: LineWithRawSource) => {
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

    const assemblerSource = (line: LineWithRawSource) => {
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

    const processedLine = (line: LineWithRawSource) => {
        symbolTable.definingLine(line);
        const assembler = assemblerSource(line);
        if (line.lastLine) {
            const check = stillInJsMode();
            if (check.type == "failures") {
                line.withFailures(check.it);
            }
        }
        return lineWithRenderedJavascript(line, assembler);
    };

    for (const line of lines) {
        yield processedLine(line);
    }
};
