import type { FunctionDirective, ObsoleteDirective } from "../directives/data-types.ts";

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
    "value": ObsoleteDirective
};

export type FunctionDefineDirectiveSymbol = {
    "type": "functionDefineDirective",
    "value": FunctionDirective
};

export type FunctionUseDirectiveSymbol = {
    "type": "functionUseDirective",
    "value": FunctionDirective
};

export type SymbolValue = NumberSymbol | StringSymbol
    | DirectiveSymbol
    | FunctionDefineDirectiveSymbol | FunctionUseDirectiveSymbol;

export type MapEntry = [UsageCount, SymbolValue];
