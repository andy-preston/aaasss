import type { TestLine } from "./testing.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest, testPipeLineWithFileStack, testPipelineWithLines } from "./testing.ts";

const testInput: Array<TestLine> = [{
    "macroName": "", "macroCount": 0,
    "label": "testLabel", "mnemonic": "TST", "symbolicOperands": []
}, {
    "macroName": "", "macroCount": 0,
    "label": "testLabel", "mnemonic": "AND", "symbolicOperands": []
}, {
    "macroName": "", "macroCount": 0,
    "label": "", "mnemonic": "TST", "symbolicOperands": []
}] as const;

const noPlaybackName = "";
const noPlaybackCount = 0;

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const system = systemUnderTest();
    const pipeline = testPipelineWithLines(system, testInput);

    pipeline.forEach((result, index) => {
        expect(result.isRecordingMacro).toBe(false);
        expect(result.macroName).toBe(noPlaybackName);
        expect(result.macroCount).toBe(noPlaybackCount);
        expect(result.label).toBe(testInput[index]!.label);
        expect(result.mnemonic).toBe(testInput[index]!.mnemonic);
    })
});

Deno.test("Whilst a macro is being defined, the isRecording flag is set", () => {
    const system = systemUnderTest();

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, testInput);
        pipeline.forEach(result => {
            expect(result.isRecordingMacro).toBe(true);
        });
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, testInput);
        pipeline.forEach(result => {
            expect(result.isRecordingMacro).toBe(false);
        });
    }
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const system = systemUnderTest();

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, testInput);
        expect([...pipeline].length).toBe(3);
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const pipeline = testPipeLineWithFileStack(system);
        const playback = [...pipeline];
        expect(playback.length).toBe(testInput.length);
        playback.forEach((result, index) => {
            expect(result.rawSource).toContain(testInput[index]!.label);
            expect(result.rawSource).toContain(testInput[index]!.mnemonic);
        });
    }
});

Deno.test("'blank' lines are not recorded in the macro", () => {
    const testInputWithBlanks: Array<TestLine> = [{
        "macroName": "", "macroCount": 0,
        "label": "", "mnemonic": "", "symbolicOperands": []
    }, {
        "macroName": "", "macroCount": 0,
        "label": "testLabel", "mnemonic": "TST", "symbolicOperands": []
    }, {
        "macroName": "", "macroCount": 0,
        "label": "testLabel", "mnemonic": "AND", "symbolicOperands": []
    }, {
        "macroName": "", "macroCount": 0,
        "label": "", "mnemonic": "TST", "symbolicOperands": []
    }, {
        "macroName": "", "macroCount": 0,
        "label": "", "mnemonic": "", "symbolicOperands": []
    }] as const;

    const system = systemUnderTest();

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, testInputWithBlanks);
        expect([...pipeline].length).toBe(5);
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const pipeline = testPipeLineWithFileStack(system);
        expect([...pipeline].length).toBe(3);
    }
});

Deno.test("Lines that are being replayed have a macro name and count", () => {
    const system = systemUnderTest();

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, testInput);
        expect([...pipeline].length).toBe(testInput.length);
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");

    const mockDirectiveUse = system.symbolTable.use("testMacro");
    expect(mockDirectiveUse.type).toBe("functionUseDirective");

    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const pipeline = testPipeLineWithFileStack(system);
        const playback = [...pipeline];
        expect(playback.length).toBe(testInput.length);
        playback.forEach(result => {
            expect(result.macroName).toBe("testMacro");
            expect(result.macroCount).toBe(1);
        });
    }
});
