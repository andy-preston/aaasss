import type { Box, Failure } from "../failure/failure-or-box.ts";

export type DirectiveResult = Box<string> | Failure;

export type ParameterDefinitions = Array<string>;

export type ActualParameters = Array<string | number>;

export type VoidDirective = {
    "parametersType": "void",
    "method": () => DirectiveResult
};

export type StringDirective = {
    "parametersType": "string",
    "method": (parameter: string) => DirectiveResult
};

export type NumberDirective = {
    "parametersType": "number",
    "method": (parameter: number) => DirectiveResult
};

export type ValueDirective = {
    "parametersType": "value",
    "method": (name: string, value: number) => DirectiveResult
};

export type DataDirective = {
    "parametersType": "data",
    "method": (data: Array<number>) => DirectiveResult
};

export type ParameterDefinitionsDirective = {
    "parametersType": "parameterDefinition",
    "method": (name: string, parameters: ParameterDefinitions) => DirectiveResult
};

export type ActualParametersDirective = {
    "parametersType": "actualParameters",
    "method": (name: string, parameters: ActualParameters) => DirectiveResult
};

export type Directive =
    VoidDirective | StringDirective | NumberDirective | DataDirective |
    ValueDirective | ParameterDefinitionsDirective | ActualParametersDirective;
