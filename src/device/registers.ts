import { SymbolTable } from "../symbol-table/symbol-table.ts";

export const cpuRegisters = (symbolTable: SymbolTable) => {
    const choose = (reducedCore: boolean) => {
        let register = reducedCore ? 16 : 0;
        while (register < 32) {
            symbolTable.internalSymbol(`R${register}`, register++);
        }
        const specialRegisters: Array<[string, number]> = [
            ["X", 26],
            ["XL", 26],
            ["XH", 27],
            ["Y", 28],
            ["YL", 28],
            ["YH", 29],
            ["Z", 30],
            ["ZL", 30],
            ["ZH", 31],
        ];
        for (const [name, value] of specialRegisters) {
            symbolTable.internalSymbol(name, value);
        }
    };

    return {
        "choose": choose,
    };
};

export type CpuRegisters = Readonly<ReturnType<typeof cpuRegisters>>;
