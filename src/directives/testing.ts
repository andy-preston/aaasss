import type { DirectiveList } from "./directive-list.ts";
import type { DirectiveFunction } from "./data-types.ts";
import type { SymbolValue } from "../symbol-table/data-types.ts";

import { expect } from "jsr:@std/expect";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { directives } from "./directives.ts";

export const testSystem = (mockDirectiveList: DirectiveList) => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $symbolTable = symbolTable($currentLine, cpuRegisters());
    directives(mockDirectiveList, $currentLine, $symbolTable);
    return {"currentLine": $currentLine, "symbolTable": $symbolTable};
};

export const isFunction = (value: SymbolValue): value is DirectiveFunction => {
    const result = typeof value == "function";
    expect(result).toBe(true);
    return result;
};
