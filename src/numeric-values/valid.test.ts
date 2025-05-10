import { expect } from "jsr:@std/expect/expect";
import { validNumeric } from "./valid.ts";
import { BagOfFailures } from "../failure/bags.ts";

Deno.test("type_anything can be any numeric value", () => {
    [0, -1, 2].forEach(value => {
        const result = validNumeric(value, "type_anything");
        expect(result.type).toBe("number");
        expect(result.it).toBe(value);
    });
});

Deno.test("type_anything must resolve to some number", () => {
    ["", "notANumber"].forEach(value => {
        const result = validNumeric(value, "type_anything");
        expect(result.type).toBe("failures");
        const failures = result as BagOfFailures;
        expect(failures.it[0]!.kind).toBe("type_failure");
    });
});
