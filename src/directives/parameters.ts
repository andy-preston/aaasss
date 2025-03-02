import {
    emptyBox, failure, type Box, type Failure
} from "../failure/failure-or-box.ts";
import type {
    JavaScriptFunction,
    VoidDirective, StringDirective,
    FunctionDefineDirective, FunctionUseDirective
} from "./data-types.ts";

const parameterTypes = (
    untyped: unknown[], required: Array<"string" | "number">
): Box<undefined> | Failure => {
    const wrongTypes: Array<string> = [];
    for (const [index, parameter] of untyped.entries()) {
        const typeOf = Array.isArray(parameter)
            ? "array" : typeof parameter;
        if (!(required as Array<string>).includes(typeOf)) {
            wrongTypes.push(`${index}: ${typeOf}`);
        }
    }
    return wrongTypes.length == 0
        ? emptyBox()
        : failure (
            undefined, "parameter_type", [required.join(", ")].concat(wrongTypes)
        );
}

const allAsString = (untyped: unknown[]): Array<string> =>
    untyped.map(element => `${element}`);

export const voidDirective = (
    directive: VoidDirective
): JavaScriptFunction => (...parameters: unknown[]) =>
    parameters.length != 0
        ? failure(undefined, "parameter_count", ["0"])
        : directive.body();

export const stringDirective = (
    directive: StringDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length != 1) {
        return failure(undefined, "parameter_count", ["1"]);
    }

    const wrongTypes = parameterTypes(parameters, ["string"]);
    return wrongTypes.which == "failure"
        ? wrongTypes
        : directive.body(allAsString(parameters)[0]!);
};

export const functionDefineDirective = (
    directive: FunctionDefineDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length == 0) {
        return failure(undefined, "parameter_firstName", []);
    }

    const wrongTypes = parameterTypes(parameters, ["string"]);
    return wrongTypes.which == "failure"
        ? wrongTypes
        : directive.body(
            parameters[0] as string, allAsString(parameters.slice(1))
        );
};

export const functionUseDirective = (
    symbolName: string, directive: FunctionUseDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const wrongTypes = parameterTypes(parameters, ["string", "number"]);
    return wrongTypes.which == "failure"
        ? wrongTypes
        : directive.body(symbolName, allAsString(parameters));
};
