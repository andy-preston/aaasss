import type { MacroInvocation } from "../macros/data-types.ts";
import type { SymbolValue } from "../symbol-table/data-types.ts";

const macroInvocation = (fun: MacroInvocation) =>
    fun;

export const typeBridge = (symbol: SymbolValue) =>
    symbol.type == "string" || symbol.type == "number"
    || symbol.type == "directive"
    ? symbol.value
    : macroInvocation(symbol.value);
