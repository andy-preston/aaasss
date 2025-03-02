import type { Box, Failure } from "../failure/failure-or-box.ts";

export type DirectiveResult = Box<string|undefined> | Failure;

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

export type FunctionDefineDirective = {
    "type": "functionDefineDirective",
    "body": (functionName: string, parameters: Array<string>) => DirectiveResult
};

export type FunctionUseDirective = {
    "type": "functionUseDirective",
    "body": (functionName: string, parameters: Array<string>) => DirectiveResult
};

export type ObsoleteDirective = {
    // deno-lint-ignore no-explicit-any
    "type": "directive", "body": (...args: any[]) => DirectiveResult
};

export type DirectiveSymbol = ObsoleteDirective
    | VoidDirective | StringDirective | NumberDirective
    | FunctionDefineDirective | FunctionUseDirective;

export type DirectiveType = DirectiveSymbol["type"];
