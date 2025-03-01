import { Directive } from "../directives/data-types.ts";
import { box, failure, isFailureOrBox, type Box, type Failure } from "../failure/failure-or-box.ts";
import { MacroInvocation } from "../macros/data-types.ts";
import { SymbolTable } from "../symbol-table/symbol-table.ts";

const trailingSemicolons = /;*$/;

export const jSExpression = (symbolTable: SymbolTable) => {

    const untypedFunction = (fun: MacroInvocation | Directive) => fun;

    const executionContext = new Proxy({}, {
        has(_target: object, symbolName: string) {
            return symbolName in globalThis || typeof symbolName != "string"
                ? false
                : symbolTable.has(symbolName, "notRegisters");
        },
        get(_target: object, symbolName: string) {
            const symbol = symbolTable.use(symbolName);
            return symbol.type == "function"
                ? untypedFunction(symbol.value)
                : symbol.value
        },
        set() {
            throw new ReferenceError("this_assignment");
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

    const boxed = (value: unknown) =>
        value == undefined ? box("") : box(`${value}`.trim());

    const reBox = (result: Failure | Box<unknown>) =>
        result.which == "failure" ? result : boxed(result.value);

    return (jsSource: string): Box<string> | Failure => {
        const clean = jsSource
            .replaceAll("\n", " ").replaceAll('"', '\\\"')
            .trim().replace(trailingSemicolons, "").trim();
        if (clean == "") {
            return box("");
        }
        const result = functionCall(
            `with (this) { return eval("${clean}"); }`
        );
        return isFailureOrBox(result) ? reBox(result) : boxed(result);
    };
};

export type JsExpression = ReturnType<typeof jSExpression>;
