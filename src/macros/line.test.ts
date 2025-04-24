import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import { boringFailure } from "../failure/bags.ts";
import { macroFromTable, systemUnderTest, testLine, testLineWithSource } from "./testing.ts";

const testLines: Array<[string, string]> = [
    ["testLabel", "TST"],
    ["testLabel", "AND"],
    ["",          "TST"]
] as const;

const irrelevantName = "testing";
const noPlaybackName = "";
const noPlaybackCount = 0;

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const system = systemUnderTest();
    for (const [label, mnemonic] of testLines) {
        const line = system.macros.assemblyPipeline(
            testLine("", 0, label, mnemonic, [])
        );
        expect(line.isRecordingMacro).toBe(false);
        expect(line.macroName).toBe(noPlaybackName);
        expect(line.macroCount).toBe(noPlaybackCount);
        expect(line.label).toBe(label);
        expect(line.mnemonic).toBe(mnemonic);
    }
});

Deno.test("Whilst a macro is being defined, the isRecording flag is set", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    for (const [label, mnemonic] of testLines) {
        const line = system.macros.assemblyPipeline(
            testLine("", 0, label, mnemonic, [])
        );
        expect(line.isRecordingMacro).toBe(true);
    }
    expect(end().type).not.toBe("failures");

    for (const [label, mnemonic] of testLines) {
        const line = system.macros.assemblyPipeline(
            testLine("", 0, label, mnemonic, [])
        );
        expect(line.isRecordingMacro).toBe(false);
    }
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    const skipFirstLine = system.macros.assemblyPipeline(testLine("", 0, "", "", []));
    expect(skipFirstLine.isRecordingMacro).toBeTruthy();
    for (const [label, mnemonic] of testLines) {
        const reconstructedLabel = label ? `${label}: ` : "";
        const reconstructedSource = `${reconstructedLabel}${mnemonic}`;
        system.macros.assemblyPipeline(
            testLineWithSource(reconstructedSource, label, mnemonic, [])
        );
    }
    expect(end().type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    expect(testMacro().type).not.toBe("failures");
    const lines = system.mockFileStack.assemblyPipeline();
    for (const [label, mnemonic] of testLines) {
        const lineSourceCode = lines.next().value!.rawSource;
        expect(lineSourceCode).toContain(label);
        expect(lineSourceCode).toContain(mnemonic);
    }
});

Deno.test("Lines with failures are not recorded in the macro", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    const skipFirstLine = system.macros.assemblyPipeline(testLine("", 0, "", "", []));
    expect(skipFirstLine.isRecordingMacro).toBeTruthy();

    const failingLine = testLineWithSource("I have failed!", "", "", []);
    failingLine.withFailure(boringFailure("js_jsMode"));
    system.macros.assemblyPipeline(failingLine);
    system.macros.assemblyPipeline(testLineWithSource("OK!", "", "", []));
    expect(end().type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    expect(testMacro().type).not.toBe("failures");
    let count = 0;
    system.mockFileStack.assemblyPipeline().forEach(line => {
        count = count + 1;
        expect(line.rawSource).not.toBe("I have failed!");
        expect(line.rawSource).toBe("OK!");
    });
    expect(count).toBe(1);
});

Deno.test("Lines that are being replayed have a macro name and count", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    for (const [label, mnemonic] of testLines) {
        system.macros.assemblyPipeline(
            testLine("", 0, label, mnemonic, [])
        );
    }
    expect(end().type).not.toBe("failures");

    for (const expectedCount of [1, 2, 3]) {
        const testMacro = directiveFunction(
            "testMacro", macroFromTable(system.symbolTable, "testMacro")
        );
        expect(testMacro().type).not.toBe("failures");
        system.mockFileStack.assemblyPipeline().forEach(line => {
            expect(line.macroName).toBe("testMacro");
            expect(line.macroCount).toBe(expectedCount);
        });
    }
});
