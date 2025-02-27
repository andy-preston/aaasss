import type { Directive } from "../directives/data-types.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { Code } from "./data-types.ts";

export const pokeBuffer = () => {
    let theBuffer: Array<Code> = [];

    const pokeDirective: Directive = (data: Array<number> | string) => {
        const bytes: Array<number> = typeof data == "string"
            ? Array.from(new TextEncoder().encode(data))
            : data;

        const grouped: Record<"good" | "bad", Array<number>> = {
            "good": [],
            "bad": []
        };

        const badBytes = () => grouped.bad.map(byte => `${byte}`);

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
            ? failure(undefined, "type_bytes", badBytes())
            : emptyBox();
    };

    const contents = () => {
        const contents = theBuffer;
        theBuffer = [];
        return contents;
    };

    return {
        "pokeDirective": pokeDirective,
        "contents": contents
    };
};

export type PokeBuffer = ReturnType<typeof pokeBuffer>;
