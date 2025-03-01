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

export type DirectiveSymbol = {
    "type": "directive",
    "value": Directive
};

export type MacroSymbol = {
    "type": "macro",
    "value": MacroInvocation
};

export type SymbolValue = NumberSymbol | StringSymbol
    | DirectiveSymbol | MacroSymbol;

export type MapEntry = [UsageCount, SymbolValue];
