import {
    box, failure, type Box, type Failure
} from "../coupling/value-failure.ts";
import {
    pokedLine, type AddressedLine, type Code, type PokedLine
} from "../coupling/line.ts";

export const pokeBuffer = () => {
    let theBuffer: Array<Code> = [];

    const directive = (data: Array<number> | string): Failure | Box<string> => {
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
            ? failure(undefined, "byte.outOfRange", grouped.bad.join(", "))
            : box("")
    };

    const line = (line: AddressedLine): PokedLine => {
        const result = pokedLine(line, theBuffer, []);
        theBuffer = [];
        return result;
    };

    return {
        "directive": directive,
        "line": line
    };
};

export type PokeBuffer = ReturnType<typeof pokeBuffer>;

