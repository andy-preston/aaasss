import { emptyBag } from "../assembler/bags.ts";
import { DataDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { oldFailure, bagOfFailures } from "../failure/bags.ts";
import type { Code } from "./data-types.ts";

const encoder = new TextEncoder();

export const pokeBuffer = () => {
    let theBuffer: Array<Code> = [];

    const poke = (data: Array<number | string>): DirectiveResult => {
        const grouped: Record<"good" | "bad", Array<number>> = {
            "good": [], "bad": []
        };

        const badBytes = () => grouped.bad.map(byte => `${byte}`);

        for (const item of data) {
            if (typeof item == "string") {
                for (const byte of encoder.encode(item)) {
                    grouped.good.push(byte);
                }
            } else {
                grouped[item < 0 || item > 0xff ? "bad" : "good"].push(item);
            }
        }
        if (grouped.good.length % 2 == 1) {
            grouped.good.push(0);
        }
        while (grouped.good.length > 0) {
            theBuffer.push(grouped.good.splice(0, 4) as unknown as Code);
        }
        return grouped.bad.length > 0
            ? bagOfFailures([oldFailure(undefined , "type_bytes", badBytes())])
            : emptyBag()
    };

    const pokeDirective: DataDirective = {
        "type": "dataDirective", "it": poke
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
