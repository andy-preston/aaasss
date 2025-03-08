import type { DirectiveResult } from "./data-types.ts";

export type VoidDirective = {
    "type": "voidDirective",
    "it": () => DirectiveResult
};

export type StringDirective = {
    "type": "stringDirective",
    "it": (parameter: string) => DirectiveResult
};

export type NumberDirective = {
    "type": "numberDirective",
    "it": (parameter: number) => DirectiveResult
};

export type ValueDirective = {
    "type": "valueDirective",
    "it": (symbolName: string, symbolValue: number) => DirectiveResult
};

export type DataDirective = {
    "type": "dataDirective",
    "it": (data: Array<number | string>) => DirectiveResult
};

export type FunctionDefineDirective = {
    "type": "functionDefineDirective",
    "it": (functionName: string, parameters: Array<string>) => DirectiveResult
};

export type FunctionUseDirective = {
    "type": "functionUseDirective",
    "it": (functionName: string, parameters: Array<string>) => DirectiveResult
};

export type BaggedDirective = VoidDirective
    | StringDirective | NumberDirective
    | ValueDirective | DataDirective
    | FunctionDefineDirective | FunctionUseDirective;

export type DirectiveType = BaggedDirective["type"];
