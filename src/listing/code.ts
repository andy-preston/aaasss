import { LineWithAddress } from "../program-memory/line-types.ts";

const objectWidth = "00 00 00 00".length;
const addressWidth = 6;

export const codeWidth = objectWidth + addressWidth + 1;

export const extractedCode = function* (line: LineWithAddress) {
    let address = line.address;
    for (const block of line.code) {
        const addressHex = address
            .toString(16)
            .toUpperCase()
            .padStart(addressWidth, "0");
        const object = block
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join(" ")
            .toUpperCase()
            .padEnd(objectWidth, " ");
        yield `${addressHex} ${object}`;
        address = address + (block.length / 2);
    }
    return "";
};

export type ExtractedCode = ReturnType<typeof extractedCode>;
