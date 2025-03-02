import type { Box, Failure } from "../failure/failure-or-box.ts";

export type DirectiveResult = Box<string|undefined> | Failure;

export type FunctionDirectiveMethod =
    (functionName: string, parameters: Array<string>) => DirectiveResult;

export type FunctionDefineDirective = {
    "type": "functionDefineDirective", "body": FunctionDirectiveMethod
};

export type FunctionUseDirective = {
    "type": "functionUseDirective", "body": FunctionDirectiveMethod
};

export type ObsoleteDirective = {
    // deno-lint-ignore no-explicit-any
    "type": "directive", "body": (...args: any[]) => DirectiveResult
};

export type DirectiveSymbol = ObsoleteDirective
    | FunctionDefineDirective | FunctionUseDirective;

