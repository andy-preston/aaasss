import type { Box, Failure } from "../failure/failure-or-box.ts";

type DirectiveResult = Box<string|undefined> | Failure;

// deno-lint-ignore no-explicit-any
export type Directive = (...args: any[]) => DirectiveResult;

