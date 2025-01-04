import { box } from "../coupling/boxed-value.ts";
import type { Directive } from "../directives/data-types.ts";
import { failure } from "../failure/failures.ts";
import { LineWithOperands } from "../javascript/operands/line-types.ts";
import { Code } from "../object-code/data-types.ts";
import { lineWithPokedBytes } from "./line-types.ts";

export const pokeBuffer = () => {
    let theBuffer: Array<Code> = [];

    const poke: Directive = (data: Array<number> | string) => {
        const bytes: Array<number> = typeof data == "string"
            ? Array.from(new TextEncoder().encode(data))
            : data;

        const grouped: Record<"good" | "bad", Array<number>> = {
            "good": [],
            "bad": []
        };

        for (const byte of bytes) {
            grouped[byte < 0 || byte > 0xff ? "bad" : "good"].push(byte);
        }
        if (grouped.good.length % 2 == 1) {
            grouped.good.push(0);
        }
        while (grouped.good.length > 0) {
            theBuffer.push(grouped.good.splice(0, 4) as unknown as Code);
        }
        return grouped.bad.length > 0
            ? failure(undefined, "type_bytes", grouped.bad.join(", "))
            : box("")
    };

    const line = (line: LineWithOperands) => {
        const result = lineWithPokedBytes(line, theBuffer);
        theBuffer = [];
        return result;
    };

    return {
        "poke": poke,
        "line": line
    };
};

export type PokeBuffer = ReturnType<typeof pokeBuffer>;
