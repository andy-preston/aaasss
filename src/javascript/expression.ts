import type { DirectiveSymbol } from "../directives/data-types.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { SymbolValue } from "../symbol-table/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

const isFailure = (it: object): it is Failure =>
    Object.hasOwn(it, "which") && Object.hasOwn(it, "kind");

const isBox = (it: object): it is Box<unknown> =>
    Object.hasOwn(it, "which") && Object.hasOwn(it, "value");

const isTidyBox = (it: object): it is Box<string | number> =>
    isBox(it) && (typeof it.value == "string" || typeof it.value == "number");

const mappedResult = (result: unknown): Box<string> | Failure =>
    typeof result == "string" || typeof result == "number"
        ? box(`${result}`)
        : !(result instanceof Object)
        ? box("") // eating unwanted non-objects (including booleans)
        : isFailure(result)
        ? result
        : isTidyBox(result)
        ? box(`${result.value}`)
        : box(""); // eating unwanted objects (including boxed booleans)

const discreteTypes = ["string", "number", "directive"];

const mappedCall = (symbolName: string, symbol: SymbolValue) => {
    return discreteTypes.includes(symbol.type)
        ? symbol.body
        : symbol.type.endsWith("Directive")
        ? directiveFunction(symbolName, symbol as DirectiveSymbol)
        : undefined;
};

const trailingSemicolons = /;*$/;

export const jSExpression = (symbolTable: SymbolTable) => {
    const executionContext = new Proxy({}, {
        has(_target: object, symbolName: string) {
            return symbolName in globalThis || typeof symbolName != "string"
                ? false
                : symbolTable.has(symbolName, "notRegisters");
        },
        get(_target: object, symbolName: string) {
            return typeof symbolName == "string"
                ? mappedCall(symbolName, symbolTable.use(symbolName))
                : undefined;
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
                return failure(undefined, "js_error", error);
            }
            throw error;
        }
    };

    return (jsSource: string): Box<string> | Failure => {
        const clean = jsSource
            .replaceAll("\n", " ")
            .replaceAll('"', '\\\"')
            .trim()
            .replace(trailingSemicolons, "")
            .trim();

        return clean == "" ? box("") : mappedResult(functionCall(clean));
    };
};

export type JsExpression = ReturnType<typeof jSExpression>;
