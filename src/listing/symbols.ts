import type { SymbolTable } from "../symbol-table/symbol-table.ts";

const registerSortKey = (key: string) =>
    key.replace(/^R([0-9])$/, "R0$1").toUpperCase();

const macroLabel = (label: string) => {
    if (label.match(/^\w+\$\w+\$\d+$/) == null) {
        return label;
    }
    return label.replace("$", " (").replace("$", " ") + ")";
}

export const formattedSymbolTable = (symbolTable: SymbolTable) => {
    const symbolList = symbolTable.list();
    if (symbolList.length == 0) {
        return [];
    }

    const symbols = symbolList.sort(
        (a, b) => registerSortKey(a[0]).localeCompare(
            registerSortKey(b[0])
        )
    );

    const stringSymbols = symbols.map(
        symbol => {
            const [decimal, hex] = typeof symbol[1] == "number"
                ? [symbol[1].toString(10), symbol[1].toString(16).toUpperCase()]
                : [symbol[1], ""];
            return [
                macroLabel(symbol[0]), decimal, hex, symbol[2], `${symbol[3]}`
            ];
        }
    );

    const width = stringSymbols.reduce(
        (widths, symbol) => widths.map(
            (width, index) => Math.max(width, symbol[index]!.length)
        ),
        [1, 1, 1, 1, 1]
    );

    return stringSymbols.map(
        (symbol) => symbol.map(
            (column, index) => column.padEnd(width[index]!)
        ).join(" | ").trimEnd()
    );
};
