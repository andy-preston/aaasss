import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import type { DeviceFileOperations } from "../device/device-file.ts";
import { deviceProperties } from "../device/properties.ts";
import { high, low } from "../directives/function-directives.ts";
import { directiveList } from "../directives/directive-list.ts";
import { illegalStateFailures } from "../failure/illegal-state.ts";
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
import { pass } from "./pass.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const currentPass = pass();

    const directives = directiveList();
    directives.includes("high", high);
    directives.includes("low", low);

    const registers = cpuRegisters();

    const device = deviceProperties();

    const chooser = deviceChooser(
        device, registers, deviceFileOperations
    );
    directives.includes("device", chooser.device);

    const symbols = symbolTable(
        directives, device.public, registers, currentPass
    );
    directives.includes("define", symbols.defineDirective);
    currentPass.resetStateCallback(symbols.reset);

    const progMem = programMemory(symbols, device.public);
    directives.includes("origin", progMem.origin);
    currentPass.resetStateCallback(progMem.reset);

    const dataMem = dataMemory(device.public);
    directives.includes("alloc", dataMem.alloc);
    directives.includes("allocStack", dataMem.allocStack);
    currentPass.resetStateCallback(dataMem.reset);

    const poke = pokeBuffer();
    directives.includes("poke", poke.poke);

    const sourceFiles = fileStack(readerMethod, fileName);
    directives.includes("include", sourceFiles.include);

    const macroProcessor = macros(symbols, sourceFiles);
    directives.includes("macro", macroProcessor.macro);
    directives.includes("end", macroProcessor.end);
    currentPass.resetStateCallback(macroProcessor.reset);

    const expression = jSExpression(symbols);
    const embedded = embeddedJs(expression);
    currentPass.resetStateCallback(embedded.reset);

    const illegalState = illegalStateFailures([
        macroProcessor.leftInIllegalState,
        embedded.leftInIllegalState
    ]);

    return assemblyPipeline(
        currentPass,
        sourceFiles.lines,
        embedded.rendered,
        tokenise,
        macroProcessor.lines,
        symbolicToNumeric(symbols, expression),
        objectCode(device.public, poke),
        progMem.addressed,
        listing(outputFile, fileName, failureMessageTranslator, symbols),
        hexFile(outputFile, fileName),
        illegalState
    );
};
