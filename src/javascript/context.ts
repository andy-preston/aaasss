import type { Directive } from "../directives/directive.ts";

type SimpleFunction = (n: number) => number;

type ContextFields = SimpleFunction | Directive | number;

export type Context = Record<string, ContextFields> & { __brand: "context" };

export const anEmptyContext = () => ({} as Context);

