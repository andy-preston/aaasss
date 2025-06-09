import type { NumberOrFailures } from "../failure/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { OperandType } from "./data-types.ts";

import { numberBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, clueFailure } from "../failure/bags.ts";

type Converter = (
    symbolic: string | undefined, operandType: OperandType
) => NumberOrFailures;

export const symbolicToNumeric = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const register = (
        symbolic: string | undefined, _operandType: OperandType
    ): NumberOrFailures =>
        symbolic == undefined
            ? bagOfFailures([boringFailure("operand_blank")])
            : !cpuRegisters.has(symbolic)
            ? bagOfFailures([clueFailure("register_notFound", `${symbolic}`)])
            : numberBag(symbolTable.use(symbolic).it as number);

    const aNumber = (
        symbolic: string | undefined, operandType: OperandType
    ): NumberOrFailures => {
        if (symbolic == undefined) {
            return bagOfFailures([boringFailure("operand_blank")]);
        }
        if (cpuRegisters.has(symbolic)) {
            return bagOfFailures([assertionFailure(
                "value_type", operandType, `register: ${symbolic}`
            )]);
        }
        const numeric = jsExpression(symbolic);
        return numeric.type == "failures" ? numeric
            : numeric.it == "" ? bagOfFailures([])
            : numberBag(parseInt(numeric.it));
    };

    const specificSymbolic = (options: Record<string, number>) =>
        (symbolic: string | undefined): NumberOrFailures => {
            for (const [symbolOption, value] of Object.entries(options)) {
                if (symbolic == undefined && symbolOption == "") {
                    return numberBag(value);
                }
                if (symbolic == symbolOption) {
                    return numberBag(value);
                }
            };
            const expectation = Object.keys(options).map(
                option => option == "" ? "undefined" : option
            ).join(", ");
            return bagOfFailures([
                assertionFailure("value_type", expectation, `${symbolic}`)
            ]);
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
    ): NumberOrFailures => {
        const converter = converters[operandType];
        return converter(symbolic, operandType);
    };
};
