import type { Directive } from "../directives/data-types.ts";
import type { MacroInvocation } from "../macros/data-types.ts";

export type UsageCount = number;

type NumberSymbol = {
    "type": "number",
    "value": number
};

type StringSymbol = {
    "type": "string",
    "value": string
};

type FunctionSymbol = {
    "type": "function",
    "value": Directive | MacroInvocation
}

export type SymbolValue = number | string | Directive | MacroInvocation;

export type SymbolResult = NumberSymbol | StringSymbol | FunctionSymbol;

export type MapEntry = [UsageCount, SymbolValue];
