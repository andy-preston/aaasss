import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import type { DeviceFileOperations } from "../device/device-file.ts";
import { deviceProperties } from "../device/properties.ts";
import type { BaggedDirective } from "../directives/bags.ts";
import { functionDirectives } from "../directives/function-directives.ts";
import { illegalStateFailures, type IllegalStateCallback } from "../failure/illegal-state.ts";
import { hexFile } from "../hex-file/hex.ts";
import { jSExpression } from "../javascript/expression.ts";
import { embeddedJs } from "../javascript/embedded.ts";
import type { FailureMessageTranslator } from "../listing/messages.ts";
import { listing } from "../listing/listing.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/object-code.ts";
import { pokeBuffer } from "../object-code/poke.ts";
import { symbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import type { FileName } from "../source-code/data-types.ts";
import { fileStack, type ReaderMethod } from "../source-code/file-stack.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { tokenise } from "../tokens/tokenise.ts";
import { assemblyPipeline } from "./assembler.ts";
import { outputFile } from "./output-file.ts";
import { pass, type ResetStateCallback } from "./pass.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const currentPass = pass();
    const illegalState = illegalStateFailures();
    const registers = cpuRegisters();
    const device = deviceProperties();
    const symbols = symbolTable(
        device.public, registers, currentPass
    );

    const link = <ComponentType extends object>(component: ComponentType) => {
        for (const property in component) {
            if (property == "resetState") {
                currentPass.resetStateCallback(
                    component[property] as ResetStateCallback
                );
            }
            if (property.endsWith("Directive")) {
                symbols.builtInSymbol(
                    property.replace("Directive", ""),
                    component[property] as BaggedDirective
                );
            }
            if (property == "leftInIllegalState") {
                illegalState.useCallback(
                    component[property] as IllegalStateCallback
                );
            }
        }
        return component;
    }

    link(functionDirectives);
    link(registers);
    link(device);
    link(symbols);

    link(deviceChooser(device, registers, deviceFileOperations));
    link(dataMemory(device.public));
    const poke = link(pokeBuffer());
    const sourceFiles = link(fileStack(readerMethod, fileName));
    const expression = link(jSExpression(symbols));

    return assemblyPipeline(
        currentPass,
        sourceFiles.lines,
        link(embeddedJs(expression)).rendered,
        tokenise,
        link(macros(symbols, sourceFiles)).lines,
        link(symbolicToNumeric(symbols, registers, expression)),
        link(objectCode(device.public, poke)),
        link(programMemory(symbols, device.public)).addressed,
        link(listing(outputFile, fileName, failureMessageTranslator, symbols)),
        link(hexFile(outputFile, fileName)),
        illegalState
    );
};
