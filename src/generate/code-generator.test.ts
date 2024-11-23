import { assert, assertEquals, assertFalse } from "assert";
import { newContext } from "../context/context.ts";
import {
    assemblyLine, rawLine, tokenisedLine, tokenisedFailures,
    type Mnemonic, type TokenisedLine, type SymbolicOperands
} from "../coupling/line.ts";
import { deviceProperties } from "../device/properties.ts";
import { newPass } from "../state/pass.ts";
import { failure } from "../value-or-failure.ts";
import { codeGenerator } from "./code-generator.ts";

const testLine = (
    mnemonic: Mnemonic,
    operands: SymbolicOperands
): TokenisedLine => tokenisedLine(
    assemblyLine(
        rawLine("", 0, "", []),
        "", []
    ),
    "", mnemonic, operands, []
);

Deno.test("Failed lines don't bother generating code", () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    const generator = codeGenerator(context, device.public, pass);
    const line = tokenisedLine(
        assemblyLine(rawLine("", 0, "", []), "", []), "", "", [],
        [failure(undefined, "js.error", undefined)]
    );
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "js.error");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with no mnemonic (no tokens) don't bother generating code", () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    const generator = codeGenerator(context, device.public, pass);
    const line = testLine("", []);
    const result = generator(line);
    assertFalse(result.failed());
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    const generator = codeGenerator(context, device.public, pass);
    const line = testLine("DES", []);
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.supportedUnknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    device.setName("testDevice");
    device.unsupportedInstructions(["DES"]);
    const generator = codeGenerator(context, device.public, pass);
    const line = testLine("DES", []);
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.notSupported");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    device.setName("testDevice");
    const generator = codeGenerator(context, device.public, pass);
    const line = testLine("NOT_REAL", []);
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.unknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    device.setName("testDevice");
    const generator = codeGenerator(context, device.public, pass);
    const line = testLine("DES", ["15"]);
    const result = generator(line);
    assertFalse(result.failed(), "didn't fail!");
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 2);
    assertEquals(result.code, [0x94, 0xfb]);
});
