import type { CurrentLine } from "../line/current-line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { isDiscrete } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { exceptionFailure } from "../failure/bags.ts";

const trailingSemicolons = /;*$/;

export const jSExpression = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    const executionContext = new Proxy({}, {
        has(_target: object, symbolName: string) {
            return symbolTable.isDefinedSymbol(symbolName);
        },
        get(_target: object, symbolName: string) {
            return symbolTable.use(symbolName);
        },
        set() {
            throw new ReferenceError("this_assignment");
        }
    });

    const functionCall = (jsSource: string): unknown => {
        const functionBody = `with (this) { return eval("${jsSource}"); }`;
        try {
            return new Function(functionBody).call(executionContext);
        } catch (error) {
            if (error instanceof Error) {
                addFailure(currentLine().failures, exceptionFailure(
                    "js_error", error.name, error.message
                ));
                return "";
            }
            throw error;
        }
    };

    return (jsSource: string): string => {
        const clean = jsSource
            .replaceAll("\n", "\\\n")
            .replaceAll('"', '\\\"')
            .trim()
            .replace(trailingSemicolons, "")
            .trim();
        const result = clean == ""
            ? ""
            : functionCall(clean);
        return isDiscrete(result)
            ? `${result}`
            : ""
    };
};

export type JsExpression = ReturnType<typeof jSExpression>;
