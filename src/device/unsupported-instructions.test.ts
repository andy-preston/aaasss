import { expect } from "jsr:@std/expect";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

Deno.test("Instructions are added to the unsupported list in groups", () => {
    const unsupported = unsupportedInstructions();
    unsupported.choose(["readModifyWrite"]);
    for (const instruction of ["LAC", "LAS", "LAT", "XCH"]) {
        expect(unsupported.isUnsupported(instruction)).toBeTruthy();
    }
    for (const instruction of ["MUL", "MULS", "MULSU"]) {
        expect(unsupported.isUnsupported(instruction)).toBeFalsy();
    }
});

Deno.test("An unknown group throws an error", () => {
    const unsupported = unsupportedInstructions();
    // cSpell:words wibbly-wobbly
    expect(
        () => { unsupported.choose(["wibbly-wobbly"]); }
    ).toThrow<Error>(
        "Unknown unsupported instruction group: wibbly-wobbly"
    );
});
