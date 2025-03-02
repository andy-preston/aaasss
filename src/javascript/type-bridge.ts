import { DirectiveResult, FunctionDirective } from "../directives/data-types.ts";
import { failure } from "../failure/failure-or-box.ts";
import type { SymbolValue } from "../symbol-table/data-types.ts";

type JavaScriptFunction = (...parameters: unknown[]) => DirectiveResult;

const stringsAndNumbers = (unchecked: unknown[]) =>
    unchecked.slice(1).every(
        element => ["string", "number"].includes(typeof element)
    );

const allStrings = (untyped: unknown[]): Array<string> =>
    untyped.slice(1).map(element => `${element}`);

export const typeBridge = () => {

    const functionDefineDirective = (
        directive: FunctionDirective
    ): JavaScriptFunction =>
        (...parameters: unknown[]) =>
            parameters.length > 0
                && parameters.every(element => typeof element == "string")
                ? directive(parameters[0] as string, allStrings(parameters))
                : failure(undefined, "macro_params", undefined);

    const functionUseDirective = (
        directive: FunctionDirective
    ): JavaScriptFunction =>
        (...parameters: unknown[]) =>
            parameters.length > 0
                && typeof parameters[0] == "string"
                && stringsAndNumbers(parameters)
                ? directive(parameters[0] as string, allStrings(parameters))
                : failure(undefined, "macro_params", undefined);

    return (symbol: SymbolValue) =>
        symbol.type == "string" || symbol.type == "number"
        || symbol.type == "directive"
        ? symbol.value
        : symbol.type == "functionDefineDirective"
        ? functionDefineDirective(symbol.value)
        : functionUseDirective(symbol.value);
};
