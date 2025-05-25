import type { Failure, SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";

Deno.test("DES has no alternative", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol(
        "deviceName", {"type": "string", "it": "testing"}
    );
    system.instructionSet.unsupportedGroups(["DES"]);

    const result = system.instructionSet.isUnsupported("DES");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures[0]!.kind).toBe("notSupported_mnemonic");
    const failure = failures[0]! as SupportFailure;
    expect(failure.used).toBe("DES");
    expect(failure.suggestion).toBe(undefined);
});

Deno.test("RCALL and RJMP are offered as alternatives to CALL and JMP", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol(
        "deviceName", {"type": "string", "it": "testing"}
    );
    system.instructionSet.unsupportedGroups(["FlashMore8"]);
    {
        const result = system.instructionSet.isUnsupported("JMP");
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect(failures[0]!.kind).toBe("notSupported_mnemonic");
        const failure = failures[0]! as SupportFailure;
        expect(failure.used).toBe("JMP");
        expect(failure.suggestion).toBe("RJMP");
    } {
        const result = system.instructionSet.isUnsupported("CALL");
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect(failures[0]!.kind).toBe("notSupported_mnemonic");
        const failure = failures[0]! as SupportFailure;
        expect(failure.used).toBe("CALL");
        expect(failure.suggestion).toBe("RCALL");
    }
});

Deno.test("ICALL and IJMP are offered as alternatives to EICALL and EIJMP", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol(
        "deviceName", {"type": "string", "it": "testing"}
    );
    system.instructionSet.unsupportedGroups(["FlashMore128"]);
    {
        const result = system.instructionSet.isUnsupported("EIJMP");
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect(failures[0]!.kind).toBe("notSupported_mnemonic");
        const failure = failures[0]! as SupportFailure;
        expect(failure.used).toBe("EIJMP");
        expect(failure.suggestion).toBe("IJMP");
    } {
        const result = system.instructionSet.isUnsupported("EICALL");
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect(failures[0]!.kind).toBe("notSupported_mnemonic");
        const failure = failures[0]! as SupportFailure;
        expect(failure.used).toBe("EICALL");
        expect(failure.suggestion).toBe("ICALL");
    }
});
