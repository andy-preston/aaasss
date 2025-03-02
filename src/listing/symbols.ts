import { SymbolTable } from "../symbol-table/symbol-table.ts";

const transform = (key: string) =>
    key.replace(/^R([0-9])$/, "R0$1").toUpperCase()

export const sortedSymbolTable = (symbolTable: SymbolTable) => {
    const symbolList = symbolTable.list();
    if (symbolList.length == 0) {
        return [];
    }

    const symbols = symbolList.sort(
        (a, b) => transform(a[0]).localeCompare(transform(b[0]))
    );

    return symbols.map(([symbolName, usageCount, symbolValue, definition]) => {
        const formatted = symbolValue == undefined  ? "" : ` = ${symbolValue}`;
        return `${symbolName}${formatted} (${usageCount}) ${definition}`.trim();
    });
};
