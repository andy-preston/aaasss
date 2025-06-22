import type { Failure } from "../failure/bags.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { OperandType } from "./data-types.ts";

import { assertionFailure, clueFailure, valueTypeFailure } from "../failure/bags.ts";

type Converter = (
    symbolic: string | undefined, operandType: OperandType
) => number | Failure;

export const numeric = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const register = (
        operand: string | undefined, _operandType: OperandType
    ): number | Failure =>
        !cpuRegisters.has(operand!)
        ? clueFailure("register_notFound", operand!)
        : parseInt(symbolTable.use(operand!) as string);

    const aNumber = (
        operand: string | undefined, operandType: OperandType
    ): number | Failure => {
        if (cpuRegisters.has(operand!)) {
            return assertionFailure(
                "value_type", operandType, `register: ${operand}`
            );
        }
        const result = operand ? jsExpression(operand) : "";
        const integer = parseInt(result);
        if (`${integer}` != result) {
            return valueTypeFailure(operandType, result);
        }
        return integer;
    };

    const specificSymbolic = (
        options: Record<string, number>
    ) => (
        operand: string | undefined
    ): number | Failure => {
        for (const [optionSymbol, optionValue] of Object.entries(options)) {
            if (operand == undefined && optionSymbol == "") {
                return optionValue;
            }
            if (operand == optionSymbol) {
                return optionValue;
            }
        };
        const explanation = Object.keys(options).map(
            optionSymbol => optionSymbol == "" ? "undefined" : optionSymbol
        ).join(", ");
        return valueTypeFailure(explanation, operand);
    };

    const converters: Record<OperandType, Converter> = {
        "register":            register,
        "registerPair":        register,
        "anyRegisterPair":     register,
        "registerMultiply":    register,
        "registerImmediate":   register,
        "onlyZ":               specificSymbolic({"Z":  0}),
        "optionalZ+":          specificSymbolic({"":   0, "Z+": 1}),
        "ZorZ+":               specificSymbolic({"Z":  0, "Z+": 1}),
        "nybble":              aNumber,
        "6BitNumber":          aNumber,
        "byte":                aNumber,
        "invertedByte":        aNumber,
        "bitIndex":            aNumber,
        "ioPort":              aNumber,
        "16BitDataAddress":    aNumber,
        "7BitDataAddress":     aNumber,
        "22BitProgramAddress": aNumber,
        "7BitRelative":        aNumber,
        "12BitRelative":       aNumber,
    };

    return (
        symbolic: string | undefined, operandType: OperandType
    ): number | Failure => {
        const converter = converters[operandType];
        return converter(symbolic, operandType);
    };
};
