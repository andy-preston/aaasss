import type { DirectiveResult, FunctionDefineDirective, FunctionUseDirective } from "../directives/data-types.ts";
import { failure } from "../failure/failure-or-box.ts";
import type { SymbolValue } from "../symbol-table/data-types.ts";


type JavaScriptFunction = (...parameters: unknown[]) => DirectiveResult;

const allStrings = (untyped: unknown[]): Array<string> =>
    untyped.map(element => `${element}`);

const javaScriptType = (untyped: unknown) => typeof untyped;
type JavaScriptType = ReturnType<typeof javaScriptType>;

const functionDefineDirective = (
    directive: FunctionDefineDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length == 0) {
        return failure(undefined, "parameter_firstName", []);
    }

    const wrongTypes: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (typeOf != "string") {
            wrongTypes.push(`${index}: ${typeOf}`);
        }
    }
    return wrongTypes.length == 0
        ? directive.body(
            parameters[0] as string,
            allStrings(parameters.slice(1))
        )
        : failure (
            undefined, "parameter_types", ["string"].concat(wrongTypes)
        );
};

const functionUseDirective = (
    symbolName: string, directive: FunctionUseDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const wrongTypes: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (!["string", "number"].includes(typeOf)) {
            wrongTypes.push(`${index}: ${typeOf}`);
        }
    }
    return wrongTypes.length == 0
        ? directive.body(symbolName, allStrings(parameters))
        : failure (
            undefined, "parameter_types", ["string, number"].concat(wrongTypes)
        );
};

export const typeBridge = (symbolName: string, symbol: SymbolValue) => {
    return symbol.type == "string" || symbol.type == "number"
    || symbol.type == "directive"
    ? symbol.body
    : symbol.type == "functionDefineDirective"
    ? functionDefineDirective(symbol)
    : functionUseDirective(symbolName, symbol);
};
