import type { Line } from "../line/line-types.ts";

const objectWidth = "00 00 00 00".length;
const addressWidth = 6;

export const codeWidth = objectWidth + addressWidth + 1;

export const extractedCode = function* (
    line: Line
): Generator<string, string, void> {
    let address = line.address;
    const bytes = line.code.flat(1).values();
    while (true) {
        const dWord = [...bytes.take(4)];
        if (dWord.length == 0) {
            return "";
        }

        const addressHex = address.toString(16).toUpperCase().padStart(
            addressWidth, "0"
        );
        address = address + (dWord.length / 2);

        const codeHex = dWord.map(
            byte => byte.toString(16).padStart(2, "0")
        ).join(" ").toUpperCase().padEnd(objectWidth, " ");

        yield `${addressHex} ${codeHex}`;
    }
};

export type ExtractedCode = ReturnType<typeof extractedCode>;
