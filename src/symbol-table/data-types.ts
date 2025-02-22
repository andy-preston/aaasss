import { MacroInvocation } from "../macros/data-types.ts";

export type UserFunction = MacroInvocation;

export type UsageCount = number;

export type SymbolValue = number | string | UserFunction;

export type MapEntry = [UsageCount, SymbolValue];
