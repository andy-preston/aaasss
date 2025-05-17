import { directiveFunction } from "../directives/directive-function.ts";
import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTablePipeline } from "./assembly-pipeline.ts";
import { symbolTable } from "./symbol-table.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $symbolTablePipeline = symbolTablePipeline($symbolTable);
    return {
        "symbolTable": $symbolTable,
        "symbolTablePipeline": $symbolTablePipeline,
        "cpuRegisters": $cpuRegisters,
    };
};

type SystemUnderTest = ReturnType<typeof systemUnderTest>;

export const testDirectives = (system: SystemUnderTest) => ({
    "define": directiveFunction(
        "define", system.symbolTablePipeline.defineDirective
    )
});
