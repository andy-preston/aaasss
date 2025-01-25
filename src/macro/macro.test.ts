import { assert, assertEquals, assertFalse } from "assert";
import { assertFailure } from "../failure/testing.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import { macro, type DefinedParameters } from "./macro.ts";
import { testLine } from "./testing.ts";

const withNoLabel = "";
const withNoMnemonic = "";
const withNoOperands: SymbolicOperands = [];

const withNoParameters: DefinedParameters = [];

const withDummyCallingLine = () =>
    testLine(withNoLabel, withNoMnemonic, withNoOperands);

Deno.test("An empty macro is flagged as such", () => {
    const testMacro = macro("testMacro", withNoParameters);
    assert(testMacro.empty());
});

Deno.test("A macro with lines isn't flagged as empty", () => {
    const testMacro = macro("testMacro", withNoParameters);
    testMacro.push(testLine(withNoLabel, "TST", withNoOperands));
    assertFalse(testMacro.empty());
    testMacro.push(testLine(withNoLabel, "TST", withNoOperands));
    assertFalse(testMacro.empty());
});

Deno.test("A macro will replay the lines pushed into it", () => {
    const testMacro = macro("testMacro", withNoParameters);
    testMacro.push(testLine(withNoLabel, "TST", withNoOperands));
    testMacro.push(testLine(withNoLabel, "AND", withNoOperands));
    testMacro.push(testLine(withNoLabel, "TST", withNoOperands));
    const playback = testMacro.playback(withNoParameters);
    const result = playback(withDummyCallingLine()).toArray();
    assertEquals(result.length, 3);
    assertEquals(result[0]!.mnemonic, "TST");
    assertEquals(result[1]!.mnemonic, "AND");
    assertEquals(result[2]!.mnemonic, "TST");
});

Deno.test("Macro parameters are substituted", () => {
    const testMacro = macro("testMacro", ["p1", "p2"]);
    testMacro.push(testLine(withNoLabel, "TST", ["p1"]));
    testMacro.push(testLine(withNoLabel, "AND", ["R15"]));
    testMacro.push(testLine(withNoLabel, "TST", ["p2"]));
    const playback = testMacro.playback([4, "test"]);
    const result = playback(withDummyCallingLine()).toArray();
    assertEquals(result[0]!.symbolicOperands, ["4"]);
    assertEquals(result[1]!.symbolicOperands, ["R15"]);
    assertEquals(result[2]!.symbolicOperands, ["test"]);
});

Deno.test("A failure is given if supplied parameters mismatch defined parameters", () => {
    const testMacro = macro("testMacro", ["p1", "p2"]);
    testMacro.push(testLine(withNoLabel, "TST", ["p1"]));
    testMacro.push(testLine(withNoLabel, "AND", ["R15"]));
    testMacro.push(testLine(withNoLabel, "TST", ["p2"]));
    const playback = testMacro.playback(["test"]);
    const result = playback(withDummyCallingLine()).toArray();
    assert(result[0]!.failed());
    result[0]!.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "macro_params");
    });
    assertFalse(result[1]!.failed());
    assertFalse(result[2]!.failed());
});

Deno.test("It still tries it's best to map mismatched parameters", () => {
    const matchedParameter = "p1";
    const mismatchedParameter = "p2";
    const unmappedParameter = "R15";
    const testMacro = macro("testMacro", [
        matchedParameter, mismatchedParameter
    ]);
    testMacro.push(testLine(withNoLabel, "TST", [matchedParameter]));
    testMacro.push(testLine(withNoLabel, "AND", [unmappedParameter]));
    testMacro.push(testLine(withNoLabel, "TST", [mismatchedParameter]));
    const playback = testMacro.playback(["test"]);
    const result = playback(withDummyCallingLine()).toArray();
    assertEquals(result[0]!.symbolicOperands, ["test"]);
    assertEquals(result[1]!.symbolicOperands, [unmappedParameter]);
    assertEquals(result[2]!.symbolicOperands, [mismatchedParameter]);
});

Deno.test("Labels are mapped on each successive usage", () => {
    const testMacro = macro("testMacro", withNoParameters);
    testMacro.push(testLine(withNoLabel, "JMP", ["label"]));
    testMacro.push(testLine("label", "TST", withNoOperands));
    testMacro.push(testLine(withNoLabel, "JMP", ["label"]));
    const playback = testMacro.playback(withNoParameters);
    const result = playback(withDummyCallingLine()).toArray();
    assertEquals(result[0]!.symbolicOperands[0]!, "testMacro$1$label");
    assertEquals(result[1]!.label, "testMacro$1$label");
    assertEquals(result[2]!.symbolicOperands[0]!, "testMacro$1$label");
});

Deno.test("External labels remain unmapped", () => {
    const testMacro = macro("testMacro", withNoParameters);
    testMacro.push(testLine(withNoLabel, "JMP", ["externalLabel"]));
    testMacro.push(testLine("label", "TST", withNoOperands));
    testMacro.push(testLine(withNoLabel, "JMP", ["externalLabel"]));
    const playback = testMacro.playback(withNoParameters);
    const result = playback(withDummyCallingLine()).toArray();
    assertEquals(result[0]!.symbolicOperands[0]!, "externalLabel");
    assertEquals(result[1]!.label, "testMacro$1$label");
    assertEquals(result[2]!.symbolicOperands[0]!, "externalLabel");
});

Deno.test("Multiple macro invocations have higher index in label mappings", () => {
    const testMacro = macro("testMacro", withNoParameters);
    testMacro.push(testLine(withNoLabel, "JMP", ["label"]));
    testMacro.push(testLine("label", "TST", withNoOperands));
    testMacro.push(testLine(withNoLabel, "JMP", ["label"]));
    const playback = testMacro.playback(withNoParameters);
    const _first = playback(withDummyCallingLine()).toArray();
    const second = playback(withDummyCallingLine()).toArray();
    assertEquals(second[0]!.symbolicOperands[0]!, "testMacro$2$label");
    assertEquals(second[1]!.label, "testMacro$2$label");
    assertEquals(second[2]!.symbolicOperands[0]!, "testMacro$2$label");
});
