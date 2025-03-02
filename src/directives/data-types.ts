import type { Box, Failure } from "../failure/failure-or-box.ts";

export type DirectiveResult = Box<string|undefined> | Failure;

// deno-lint-ignore no-explicit-any
export type ObsoleteDirective = (...args: any[]) => DirectiveResult;

export type FunctionDirective = (
    macroName: string, parameters: Array<string>
) => DirectiveResult;

export type Directive = ObsoleteDirective | FunctionDirective;

