import type { DirectiveSymbol } from "../directives/data-types.ts";

export type UsageCount = number;

type NumberSymbol = {
    "type": "number",
    "body": number
};

type StringSymbol = {
    "type": "string",
    "body": string
};

export type SymbolValue = NumberSymbol | StringSymbol | DirectiveSymbol;

export type MapEntry = [UsageCount, SymbolValue];
