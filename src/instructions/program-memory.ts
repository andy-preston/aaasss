import type { InstructionSet } from "../device/instruction-set.ts";
import { boringFailure, clueFailure, typeFailure } from "../failure/bags.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mnemonics = ["SPM", "ELPM", "LPM"];

type BitString = "0" | "1";

export const programMemory = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {

    const codeGenerator = (instructionSet: InstructionSet) => {

        const storeIndexBit = (): BitString => {
            if (line.symbolicOperands.length == 0) {
                return "0";
            }

            if (line.symbolicOperands.length > 1) {
                line.withFailure(clueFailure("operand_count", "0/1"));
                return "0";
            }

            const indexRegister = line.symbolicOperands[0];
            if (indexRegister != "Z+") {
                const failure = typeFailure(
                    "operand_symbolic", "Z+", indexRegister
                );
                failure.location = { "operand": 0 };
                line.withFailure(failure);
                return "0";
            }

            const unsupported = instructionSet.isUnsupported(
                `SPM.${indexRegister}`
            );
            if (unsupported.type == "failures") {
                line.withFailures(unsupported.it);
                return "0";
            }

            return "1";
        };

        const store = (): Code =>
            template(`1001_0101 111${storeIndexBit()}_1000`, []);


        const explicitIndexBit = (): BitString => {
            if (line.symbolicOperands.length != 2) {
                line.withFailure(clueFailure("operand_count", "0/2"));
                return "0";
            }

            const indexRegister = line.symbolicOperands[1];
            if (!["Z", "Z+"].includes(indexRegister)) {
                const failure = typeFailure(
                    "operand_symbolic", "Z/Z+", indexRegister
                );
                failure.location = { "operand": 1 };
                line.withFailure(failure);
                return "0";
            }

            return indexRegister == "Z" ? "0" : "1";
        };

        const implicitLoad = () => {
            if (line.mnemonic != "LPM") {
                return;
            }
            const unsupported = instructionSet.isUnsupported("ELPM");
            if (unsupported.type == "failures") {
                return;
            }
            line.withFailure(boringFailure("mnemonic_implicitElpmNotLpm"));
        };

        const load = (): Code => {
            if (line.symbolicOperands.length == 0) {
                implicitLoad();
                return template("1001_0101 1101_1000", []);
            }

            const mnemonicBit = line.mnemonic == "ELPM" ? "1" : "0";
            const actualOperands = validScaledOperands(line, [
                ["register", "type_register", 0],
                ["index",    "type_nothing", 1]
            ]);
            return template(
                `1001_000d dddd_01${mnemonicBit}${explicitIndexBit()}`,
                [["d", actualOperands[0]!]]
            );
        };

        return lineWithObjectCode(
            line, line.mnemonic == "SPM" ? store() : load()
        );
    };

    return mnemonics.includes(line.mnemonic) ? codeGenerator : undefined;
};
