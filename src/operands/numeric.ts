import type { AssertionFailure, Failure } from "../failure/bags.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Conversion, StringConversion, OperandType } from "./data-types.ts";

import { clueFailure, valueTypeFailure } from "../failure/bags.ts";

export const numeric = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const register = (
        operand: string, _operandType: OperandType
    ): number | Failure =>
        !cpuRegisters.has(operand)
        ? clueFailure("register_notFound", operand)
        : parseInt(symbolTable.use(operand) as string);

    const expression = (
        operand: string, _operandType: OperandType
    ): number | Failure => {
        if (!operand) {
            return valueTypeFailure("directive", operand);
        }
        jsExpression(operand);
        return 0;
    }

    const aNumber = (
        operand: string, operandType: OperandType
    ): number | Failure => {
        if (cpuRegisters.has(operand)) {
            return valueTypeFailure(operandType, `register: ${operand}`);
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
        operand: string, _operandType: OperandType
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

    const offsetIndex = (options: Record<string, number>) => {
        const specific = specificSymbolic(options);
        return (
            operand: string, operandType: OperandType
        ): number | Failure => {
            const result = specific(operand.slice(0, 2), operandType);
            if (typeof result != "number") {
                (result as AssertionFailure).actual = operand;
            }
            return result;
        };
    };

    const offsetValue = (
        operand: string, operandType: OperandType
    ): number | Failure => {
        const result = aNumber(operand.slice(2), operandType);
        if (typeof result != "number") {
            (result as AssertionFailure).actual = operand;
        }
        return result;
    }

    const converters: Record<OperandType, StringConversion> = {
        "directiveDummy":      expression,
        "register":            register,
        "registerPair":        register,
        "anyRegisterPair":     register,
        "registerMultiply":    register,
        "registerImmediate":   register,
        "onlyZ":               specificSymbolic({"Z":  0}),
        "optionalZ+":          specificSymbolic({"":   0, "Z+": 1}),
        "ZorZ+":               specificSymbolic({"Z":  0, "Z+": 1}),
        "indexIndirect":       specificSymbolic({
            "Z": 0b00000, "Z+": 0b10001, "-Z": 0b10010,
            "Y": 0b01000, "Y+": 0b11001, "-Y": 0b11010,
            "X": 0b11100, "X+": 0b11101, "-X": 0b11110
        }),
        "indexWithOffset":     offsetIndex({"Z+": 0, "Y+": 1}),
        "6BitOffset":          offsetValue,
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

    const conversion = (
        operand: string, operandType: OperandType
    ): number | Failure => {
        const converter = converters[operandType];
        return converter(operand, operandType);
    };
    return conversion as Conversion;
};
