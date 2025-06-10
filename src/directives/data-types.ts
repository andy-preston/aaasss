import type { StringOrFailures } from "../failure/bags.ts";

export type DirectiveResult = StringOrFailures;

export type JavaScriptFunction = (...parameters: unknown[]) => string;
