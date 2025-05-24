import type { ValueDirective } from "../directives/bags.ts";
import type { SymbolTable } from "./symbol-table.ts";

import { numberBag } from "../assembler/bags.ts";

export const symbolTablePipeline = (symbolTable: SymbolTable) => {

    const defineDirective: ValueDirective = {
        // This is the directive for doing a "define" operation
        // not a function for defining directives.
        // The number of times I've assumed the wrong thing is ridiculous!
        "type": "valueDirective",
        "it": (symbolName: string, value: number) =>
            symbolTable.persistentSymbol(symbolName, numberBag(value))
    };

    return {
        "defineDirective": defineDirective,
        "reset": symbolTable.reset
    };
}

export type SymbolTablePipeline = ReturnType<typeof symbolTablePipeline>;