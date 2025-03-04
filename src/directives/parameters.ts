import {
    emptyBox, failure, type Box, type Failure
} from "../failure/failure-or-box.ts";
import type {
    JavaScriptFunction,
    VoidDirective, StringDirective, NumberDirective, ValueDirective,
    FunctionDefineDirective, FunctionUseDirective,
    DataDirective
} from "./data-types.ts";

const cleverType = (it: unknown) => Array.isArray(it) ? "array" : typeof it;

const allAsString = (them: unknown[]) => them.map(element => `${element}`);

const parameterTypes = (
    them: unknown[],
    required: Array<"string" | "number">,
    length: number | undefined
): Box<undefined> | Failure => {
    const requiredIncludes = (included: string) =>
        (required as Array<string>).includes(included);

    if (length != undefined && length != them.length) {
        return failure(undefined, "parameter_count", [`${length}`]);
    }

    const wrongTypes: Array<string> = [];
    for (const [index, parameter] of them.entries()) {
        const typeOf = cleverType(parameter);
        if (!requiredIncludes(typeOf)) {
            wrongTypes.push(`${index}: ${typeOf}`);
        }
    }
    return wrongTypes.length == 0 ? emptyBox() : failure (
        undefined, "parameter_type", [required.join(", ")].concat(wrongTypes)
    );
}

export const voidDirective = (
    directive: VoidDirective
): JavaScriptFunction => (...parameters: unknown[]) =>
    parameters.length != 0
        ? failure(undefined, "parameter_count", ["0"])
        : directive.body();

export const stringDirective = (
    directive: StringDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string"], 1);
    return check.which == "failure"
        ? check
        : directive.body(allAsString(parameters)[0]!);
};

export const numberDirective = (
    directive: NumberDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], 1);
    if (check.which == "failure") {
        return check;
    }
    const given = parameters[0]! as number | string;
    const numeric = typeof given == "string" ? parseInt(given) : given;
    return `${given}` != `${numeric}`
        ? failure(undefined, "parameter_type", ["number", "0: string"])
        : directive.body(numeric);
};

export const valueDirective = (
    directive: ValueDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length != 2) {
        return failure(undefined, "parameter_count", ["2"]);
    }
    const typeOfFirst = typeof parameters[0];
    if (typeOfFirst != "string") {
        return failure (
            undefined, "parameter_type", ["string", `0: ${typeOfFirst}`]
        );
    }
    const typeOfSecond = typeof parameters[1];
    if (typeOfSecond != "number") {
        return failure (
            undefined, "parameter_type", ["number", `1: ${typeOfSecond}`]
        );
    }
    return directive.body(parameters[0] as string, parameters[1] as number);
};

export const dataDirective = (
    directive: DataDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    if (check.which == "failure") {
        return check;
    }
    return directive.body(parameters as Array<number | string>);
};

export const functionDefineDirective = (
    directive: FunctionDefineDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length == 0) {
        return failure(undefined, "parameter_firstName", []);
    }
    const check = parameterTypes(parameters, ["string"], undefined);
    return check.which == "failure"
        ? check
        : directive.body(
            parameters[0] as string, allAsString(parameters.slice(1))
        );
};

export const functionUseDirective = (
    symbolName: string, directive: FunctionUseDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    return check.which == "failure"
        ? check
        : directive.body(symbolName, allAsString(parameters));
};
