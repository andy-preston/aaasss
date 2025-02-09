import { box, failure, isFailureOrBox, type Box, type Failure } from "../failure/failure-or-box.ts";
import { SymbolTable } from "../symbol-table/symbol-table.ts";
import { returnIfExpression } from "./magic.ts";

const trailingSemicolons = /;*$/;

export const jSExpression = (symbolTable: SymbolTable) => {
    const executionContext = new Proxy({}, {
        has(_target: object, symbolName: string) {
            const result =
                symbolName in globalThis || typeof symbolName != "string"
                    ? false
                    : symbolTable.has(symbolName);
            return result;
        },
        get(_target: object, symbolName: string) {
            return typeof symbolName == "string"
                ? symbolTable.use(symbolName)
                : undefined;
        }
    });

    const functionCall = (functionBody: string) => {
        try {
            return new Function(functionBody).call(executionContext);
        } catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "js_error", error);
            }
            throw error;
        }
    };

    return (jsSource: string): Box<string> | Failure => {
        const trimmed = jsSource.trim().replace(trailingSemicolons, "").trim();
        if (trimmed == "") {
            return box("");
        }
        const result = functionCall(
            `with (this) { ${returnIfExpression(trimmed)}; }`
        );
        return result == undefined
            ? box("")
            : isFailureOrBox(result)
            ? result as Box<string> | Failure
            : box(`${result}`.trim());
    };
};

export type JsExpression = ReturnType<typeof jSExpression>;
