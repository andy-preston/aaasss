import { failure } from "../failure/failure-or-box.ts";
import type {
    Directive, DirectiveResult,
    VoidDirective, StringDirective, NumberDirective,
    ValueDirective, DataDirective,
    ParameterDefinitionsDirective, ActualParametersDirective
} from "./data-types.ts";

export type JavaScriptDirective = (...parameters: unknown[]) => DirectiveResult;

const stringsAndNumbers = (unchecked: unknown[]) =>
    unchecked.every(element => ["string", "number"].includes(typeof element));

const voidDirective = (
    directive: VoidDirective
): JavaScriptDirective => (...parameters: unknown[]) =>
    parameters.length == 0
        ? directive.method()
        : failure(undefined, "macro_params", undefined);

const stringDirective = (
    directive: StringDirective
): JavaScriptDirective => (...parameters: unknown[]) =>
    parameters.length == 1
        && typeof parameters[0] == "string"
        ? directive.method(parameters[0] as string)
        : failure(undefined, "macro_params", undefined);

const numberDirective = (
    directive: NumberDirective
): JavaScriptDirective => (...parameters: unknown[]) =>
    parameters.length == 1
        && typeof parameters[0] == "number"
        ? directive.method(parameters[0] as number)
        : failure(undefined, "macro_params", undefined);

const valueDirective = (
    directive: ValueDirective
): JavaScriptDirective => (...parameters: unknown[]) =>
    parameters.length == 2
        && typeof parameters[0] == "string"
        && typeof parameters[1] == "number"
        ? directive.method(parameters[0] as string, parameters[1] as number)
        : failure(undefined, "macro_params", undefined);

const remappedData = (untyped: unknown[]): Array<number> => {
    const encoder = new TextEncoder();
    return untyped.flatMap(
        element => typeof element == "string"
            ? Array.from(encoder.encode(element))
            : element as number
    );
};

const dataDirective = (
    directive: DataDirective
): JavaScriptDirective => (...parameters: unknown[]) =>
    stringsAndNumbers(parameters)
        ? directive.method(remappedData(parameters))
        : failure(undefined, "macro_params", undefined);

const remaining = (parameters: unknown[]) =>
    parameters.slice(1) as Array<string>;

const parameterDefinitionsDirective = (
    directive: ParameterDefinitionsDirective
): JavaScriptDirective => (...parameters: unknown[]) =>
    // the name of the (e.g.) macro - and it's 0-n parameters
    parameters.length > 1
        && parameters.every(element => typeof element == "string")
        ? directive.method(parameters[0] as string, remaining(parameters))
        : failure(undefined, "macro_params", undefined);

const allStrings = (untyped: unknown[]): Array<string> =>
    untyped.map(element => `${element}`);

const actualParametersDirective = (
    directive: ActualParametersDirective,
    directiveName: string, expectedLength: number
): JavaScriptDirective => (...parameters: unknown[]) =>
    parameters.length == expectedLength
        && stringsAndNumbers(parameters)
        ? directive.method(directiveName, allStrings(parameters))
        : failure(undefined, "macro_params", undefined)

type ParameterType = Directive["parametersType"];

export const javascriptDirectives = {
    "void": voidDirective,
    "string": stringDirective,
    "number": numberDirective,
    "value": valueDirective,
    "data": dataDirective,
    "parameterDefinition": parameterDefinitionsDirective,
    "actualParameters": actualParametersDirective
} as const satisfies Record<ParameterType, unknown>;
