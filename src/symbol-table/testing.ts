import { directiveFunction } from "../directives/directive-function.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

export const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(registers);
    return {
        "symbolTable": symbols,
        "cpuRegisters": registers,
    };
};

type SystemUnderTest = ReturnType<typeof systemUnderTest>;

export const testDirectives = (system: SystemUnderTest) => ({
    "define": directiveFunction("define", system.symbolTable.defineDirective)
});
