import { emptyBag, stringBag, type NumberBag, type StringBag } from "../assembler/bags.ts";
import type { BaggedDirective } from "../directives/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import {
    bagOfFailures, exceptionFailure,
    type BagOfFailures, type BagOrFailures, type StringOrFailures
} from "../failure/bags.ts";
import type { SymbolBag } from "../symbol-table/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

const isBagOrFailures = (it: object): it is BagOrFailures =>
    Object.hasOwn(it, "type") && Object.hasOwn(it, "it");

const isFailures = (it: object): it is BagOfFailures =>
    isBagOrFailures(it) && it.type == "failures";

const isTidyValue = (it: object): it is StringBag | NumberBag =>
    isBagOrFailures(it) && (it.type == "string" || it.type == "number");

const mappedResult = (result: unknown): StringOrFailures =>
    typeof result == "string" || typeof result == "number"
        ? stringBag(`${result}`)
        : !(result instanceof Object)
        ? emptyBag() // eating unwanted non-objects (including booleans)
        : isFailures(result)
        ? result
        : isTidyValue(result)
        ? stringBag(`${result.it}`)
        : emptyBag(); // eating unwanted objects (including boxed booleans)

const discreteTypes = ["string", "number", "directive"];

const mappedCall = (symbolName: string, symbol: SymbolBag) => {
    return discreteTypes.includes(symbol.type)
        ? symbol.it
        : symbol.type.endsWith("Directive")
        ? directiveFunction(symbolName, symbol as BaggedDirective)
        : undefined;
};

const trailingSemicolons = /;*$/;

export const jSExpression = (symbolTable: SymbolTable) => {
    const executionContext = new Proxy({}, {
        has(_target: object, symbolName: string) {
            return symbolName in globalThis || typeof symbolName != "string"
                ? false
                : symbolTable.isDefinedSymbol(symbolName);
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
                return bagOfFailures([
                    exceptionFailure("js_error", error.name, error.message)
                ]);
            }
            throw error;
        }
    };

    return (jsSource: string): StringOrFailures => {
        const clean = jsSource
            .replaceAll("\n", " ")
            .replaceAll('"', '\\\"')
            .trim()
            .replace(trailingSemicolons, "")
            .trim();

        return clean == "" ? emptyBag() : mappedResult(functionCall(clean));
    };
};

export type JsExpression = ReturnType<typeof jSExpression>;
