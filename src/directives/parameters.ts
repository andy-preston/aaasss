import { failure } from "../failure/failure-or-box.ts";
import type { FunctionDefineDirective, FunctionUseDirective, JavaScriptFunction } from "./data-types.ts";

const allStrings = (untyped: unknown[]): Array<string> =>
    untyped.map(element => `${element}`);

export const functionDefineDirective = (
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

export const functionUseDirective = (
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
