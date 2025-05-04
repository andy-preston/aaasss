import { directiveFunction } from "../directives/directive-function.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTablePipeline } from "./assembly-pipeline.ts";
import { symbolTable } from "./symbol-table.ts";

export const systemUnderTest = () => {
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);
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
