import type { DataDirective } from "../directives/data-types.ts";
import { box, failure } from "../failure/failure-or-box.ts";
import type { Code } from "./data-types.ts";

const encoder = new TextEncoder();

export const pokeBuffer = () => {
    let theBuffer: Array<Code> = [];

    const pokeDirective: DataDirective = {
        "type": "dataDirective",
        "body": (data: Array<number | string>) => {
            const grouped: Record<"good" | "bad", Array<number>> = {
                "good": [],
                "bad": []
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
                ? failure(undefined, "type_bytes", badBytes())
                : box("");
        }
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
