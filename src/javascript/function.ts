import type { CurrentLine } from "../assembler/line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { exceptionFailure } from "../failure/bags.ts";

export const jsFunction = (
    currentLine: CurrentLine, symbolTable: SymbolTable,
) => {
    const proxy = new Proxy({}, {
        has(_target: object, symbolName: string) {
            return symbolTable.has(symbolName);
        },
        get(_target: object, symbolName: string | symbol) {
            if (symbolName == Symbol.unscopables) {
                return undefined;
            }
            return symbolTable.use(symbolName as string);
        },
        set() {
            throw new ReferenceError("this_assignment");
        }
    });

    return (jsSource: string): unknown => {
        const functionBody = `with (this) { ${jsSource} }`;
        try {
            return new Function(functionBody).call(proxy);
        } catch (error) {
            if (error instanceof Error) {
                //console.error(error.stack);
                currentLine().failures(exceptionFailure(
                    "js_error", error.name, error.message
                ));
                return "";
            }
            throw error;
        }
    };
};

export type JsFunction = ReturnType<typeof jsFunction>;
