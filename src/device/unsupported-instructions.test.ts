import { assert, assertFalse, assertThrows } from "assert";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

Deno.test ("Instructions are added to the unssuported list in groups", () => {
    const unsupported = unsupportedInstructions();
    unsupported.choose(["readModifyWrite"]);
    for (const instruction of ["LAC", "LAS", "LAT", "XCH"]) {
        assert(unsupported.isUnsupported(instruction));
    }
    for (const instruction of ["MUL", "MULS", "MULSU"]) {
        assertFalse(unsupported.isUnsupported(instruction));
    }
});

Deno.test ("An unknown group throws an error", () => {
    const unsupported = unsupportedInstructions();
    // cSpell:words wibbly-wobbly
    assertThrows(
        () => { unsupported.choose(["wibbly-wobbly"]); },
        Error,
        "Unknown unsupported instruction group: wibbly-wobbly"
    );
});
