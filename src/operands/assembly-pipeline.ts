import type { ImmutableLine } from "../assembler/line.ts";
import type { Failure, NumberOrFailures } from "../failure/bags.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { LineWithProcessedMacro } from "../macros/line-types.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type {
    NumericOperand, NumericOperands, OperandType, OperandTypes,
    SymbolicOperand, OperandIndex
} from "./data-types.ts";
import type { IndexOperand } from "./index-operands.ts";

import { numberBag } from "../assembler/bags.ts";
import { operands } from "./data-types.ts";
import { indexOperands } from "./index-operands.ts";
import { lineWithOperands } from "./line-types.ts";

export const symbolicToNumeric = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const valueAndType = (
        symbolicOperand: SymbolicOperand
    ): [NumberOrFailures, OperandType] => {
        if (indexOperands.includes(symbolicOperand as IndexOperand)) {
            return [numberBag(0), "index"];
        }
        if (cpuRegisters.has(symbolicOperand)) {
            const usageCounted = symbolTable.use(symbolicOperand).it;
            return [numberBag(usageCounted as number), "register"];
        }
        const numeric = jsExpression(symbolicOperand);
        return numeric.type == "failures" ? [numeric, "failure"]
            : numeric.it == "" ? [numberBag(0), "number"]
            : [numberBag(parseInt(numeric.it)), "number"];
    };

    const converted = (line: LineWithProcessedMacro) => {
        const numericOperands: Array<NumericOperand> = [];
        const operandTypes: Array<OperandType> = [];

        const numericFailed = (
            failures: Array<Failure>, operandIndex: OperandIndex
        ) => {
            line.withFailures(failures.map(failure => {
                failure.location = { "operand": operandIndex };
                return failure;
            }));
        };

        for (const [index, symbolic] of line.symbolicOperands.entries()) {
            const [numeric, operandType] = valueAndType(symbolic);
            operandTypes.push(operandType);
            if (numeric.type == "failures") {
                numericOperands.push(0);
                numericFailed(
                    numeric.it as Array<Failure>, index as OperandIndex
                );
            } else {
                numericOperands.push(numeric.it);
            }
        }
        return lineWithOperands(
            line,
            operands<NumericOperands>(numericOperands),
            operands<OperandTypes>(operandTypes)
        );
    };

    const assemblyPipeline = function* (
        // If we're recording a macro - the symbolic operands are going to be
        // re-defined on playback and the numeric operands re-calculated then
        // and there's nothing much to do here.
        lines: IterableIterator<ImmutableLine>
    ) {
        for (const line of lines) {
            yield line.isRecordingMacro
                ? lineWithOperands(line, [], [])
                : converted(line);
        }
    };

    return {
        "assemblyPipeline": assemblyPipeline
    };
};

export type SymbolicToNumeric = ReturnType<typeof symbolicToNumeric>;
