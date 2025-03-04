import type { Box, Failure } from "../failure/failure-or-box.ts";

export type DirectiveResult = Box<string> | Failure;

export type JavaScriptFunction = (...parameters: unknown[]) => DirectiveResult;

export type VoidDirective = {
    "type": "voidDirective",
    "body": () => DirectiveResult
};

export type StringDirective = {
    "type": "stringDirective",
    "body": (parameter: string) => DirectiveResult
};

export type NumberDirective = {
    "type": "numberDirective",
    "body": (parameter: number) => DirectiveResult
};

export type ValueDirective = {
    "type": "valueDirective",
    "body": (symbolName: string, symbolValue: number) => DirectiveResult
};

export type DataDirective = {
    "type": "dataDirective",
    "body": (data: Array<number | string>) => DirectiveResult
};

export type FunctionDefineDirective = {
    "type": "functionDefineDirective",
    "body": (functionName: string, parameters: Array<string>) => DirectiveResult
};

export type FunctionUseDirective = {
    "type": "functionUseDirective",
    "body": (functionName: string, parameters: Array<string>) => DirectiveResult
};

export type DirectiveSymbol = VoidDirective
    | StringDirective | NumberDirective
    | ValueDirective | DataDirective
    | FunctionDefineDirective | FunctionUseDirective;

export type DirectiveType = DirectiveSymbol["type"];
