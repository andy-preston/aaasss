import { Box } from "../coupling/boxed-value.ts";
import { Failure } from "../failure/failures.ts";

// deno-lint-ignore no-explicit-any
export type Directive = (...args: any[]) => Box<string> | Failure;
