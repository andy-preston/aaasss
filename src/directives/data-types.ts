import type { Box, Failure } from "../failure/failure-or-box.ts";

// deno-lint-ignore no-explicit-any
export type Directive = (...args: any[]) => Box<string> | Failure;
