import { expect } from "jsr:@std/expect";
import { deviceProperties } from "../device/properties.ts";
import type { BoringFailure } from "../failure/bags.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { objectCode } from "./object-code.ts";
import { pokeBuffer } from "./poke.ts";
import { stringBag } from "../assembler/bags.ts";

const systemUnderTest = () => {
    const symbols = symbolTable(cpuRegisters());
    const device = deviceProperties(symbols);
    return {
        "deviceProperties": device,
        "symbolTable": symbols,
        "objectCode": objectCode(device.public, pokeBuffer())
    };
};

const testLine = (
    label: Label, mnemonic: Mnemonic,
    symbolic: SymbolicOperands, numeric: NumericOperands, types: OperandTypes,
    isRecordingMacro: boolean,
) => {
    const raw = lineWithRawSource("", 0, "", "", 0, false);
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, mnemonic, symbolic);
    const processed = lineWithProcessedMacro(tokenised, isRecordingMacro);
    return lineWithOperands(processed, numeric, types);
};

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const system = systemUnderTest();
    const line = testLine("", "", [], [], [], false);
    const result = system.objectCode(line);
    expect(result.failed()).toBeFalsy();
    expect(result.failures.length).toBe(0);
    expect(result.code.length).toBe(0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const system = systemUnderTest();
    const line = testLine("", "DES", [], [], [], false);
    const result = system.objectCode(line);
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("mnemonic_supportedUnknown");
    expect(result.code.length).toBe(0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.deviceProperties.unsupportedInstructions(["DES"]);
    const line = testLine("", "DES", [], [], [], false);
    const result = system.objectCode(line);
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0] as BoringFailure;
    expect(failure.kind).toBe("mnemonic_notSupported");
    expect(result.code.length).toBe(0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));

    const line = testLine("", "NOT_REAL", [], [], [], false);
    const result = system.objectCode(line);
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0] as BoringFailure;
    expect(failure.kind).toBe("mnemonic_unknown");
    expect(result.code.length).toBe(0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const line = testLine("", "DES", ["15"], [15], ["number"], false);
    const result = system.objectCode(line);
    expect(result.failed()).toBeFalsy();
    expect(result.code).toEqual([[0x94, 0xfb]]);
});

Deno.test("If a line has `isRecordingMacro == true`, no code is generated", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const line = testLine("", "DES", ["15"], [15], ["number"], true);
    const result = system.objectCode(line);
    expect(result.failed()).toBeFalsy();
    expect(result.code.length).toBe(0);
});
