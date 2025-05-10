import type { InstructionSet } from "../device/instruction-set.ts";
import type { BinaryDigit, Code, EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { assertionFailure, boringFailure } from "../failure/bags.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mnemonics = ["SPM", "ELPM", "LPM"];

export const programMemory = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {

    const codeGenerator = (
        instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const storeIndexBit = (): BinaryDigit => {
            if (line.symbolicOperands.length == 0) {
                return "0";
            }

            if (line.symbolicOperands.length > 1) {
                line.withFailures([assertionFailure(
                    "operand_count", "0/1", `${line.symbolicOperands.length}`
                )]);
                return "0";
            }

            const indexRegister = line.symbolicOperands[0];
            if (indexRegister != "Z+") {
                const failure = assertionFailure(
                    "operand_symbolic", "Z+", indexRegister
                );
                failure.location = { "operand": 0 };
                line.withFailures([failure]);
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
            template(`1001_0101 111${storeIndexBit()}_1000`, {});


        const explicitIndexBit = (): BinaryDigit => {
            if (line.symbolicOperands.length != 2) {
                line.withFailures([assertionFailure(
                    "operand_count", "0/2", `${line.symbolicOperands.length}`
                )]);
                return "0";
            }

            const indexRegister = line.symbolicOperands[1];
            if (!["Z", "Z+"].includes(indexRegister)) {
                const failure = assertionFailure(
                    "operand_symbolic", "Z/Z+", indexRegister
                );
                failure.location = { "operand": 1 };
                line.withFailures([failure]);
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
            line.withFailures([boringFailure("mnemonic_implicitElpmNotLpm")]);
        };

        const load = (): Code => {
            if (line.symbolicOperands.length == 0) {
                implicitLoad();
                return template("1001_0101 1101_1000", {});
            }

            const mnemonicBit = line.mnemonic == "ELPM" ? "1" : "0";
            const actualOperands = validScaledOperands(line, [
                ["register", "type_register"],
                ["index",    "type_anything"]
            ]);
            return template(
                `1001_000r rrrr_01${mnemonicBit}${explicitIndexBit()}`,
                {"r": actualOperands[0]!}
            );
        };

        return lineWithObjectCode(
            line, line.mnemonic == "SPM" ? store() : load()
        );
    };

    return mnemonics.includes(line.mnemonic) ? codeGenerator : undefined;
};
