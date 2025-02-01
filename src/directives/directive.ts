import type { Box, Failure } from "../failure/failure-or-box.ts";
import type { Context } from "../javascript/context.ts";

// deno-lint-ignore no-explicit-any
export type Directive = (...args: any[]) => Box<string|undefined> | Failure;

export const directive = (context: Context, name: string, directive: Directive) => {
    Object.defineProperty(context, name, {
        "configurable": false,
        "enumerable": true,
        "value": directive,
        "writable": false
    });
};

