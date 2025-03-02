import { DirectiveResult, FunctionDefineDirective, FunctionDirectiveMethod, FunctionUseDirective } from "../directives/data-types.ts";
import { failure } from "../failure/failure-or-box.ts";
import type { SymbolValue } from "../symbol-table/data-types.ts";


type JavaScriptFunction = (...parameters: unknown[]) => DirectiveResult;

const allStrings = (untyped: unknown[]): Array<string> =>
    untyped.slice(1).map(element => `${element}`);

const javaScriptType = (untyped: unknown) => typeof untyped;
type JavaScriptType = ReturnType<typeof javaScriptType>;

const functionDirective = (
    method: FunctionDirectiveMethod, allowedTypes: Array<JavaScriptType>
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length == 0) {
        return failure(undefined, "parameter_firstName", []);
    }

    const wrongTypes: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (!allowedTypes.includes(typeOf)) {
            wrongTypes.push(`${index}: ${typeOf}`);
        }
    }
    if (wrongTypes.length > 0) {
        return failure (
            undefined, "parameter_types",
            [allowedTypes.join(", ")].concat(wrongTypes)
        );
    }

    return method(parameters[0] as string, allStrings(parameters));
};

const functionDefineDirective = (directive: FunctionDefineDirective) =>
    functionDirective(directive.body, ["string"]);

const functionUseDirective = (directive: FunctionUseDirective) =>
    functionDirective(directive.body, ["string", "number"]);

export const typeBridge = (symbol: SymbolValue) => {
    console.log("typeBridge", symbol.type);
    return symbol.type == "string" || symbol.type == "number"
    || symbol.type == "directive"
    ? symbol.body
    : symbol.type == "functionDefineDirective"
    ? functionDefineDirective(symbol)
    : functionUseDirective(symbol);
};
