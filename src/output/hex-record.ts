import type { PairOfBytes } from "./hex-buffer.ts";

const dataRecordType = "00";

const hex = (value: number, digits: number) =>
    value.toString(16).toUpperCase().padStart(digits, "0");

export const hexRecord = (address: number) => {
    const dataBytes: Array<string> = [];
    let checksumTotal = (address & 0xff) + ((address & 0xff00) >> 8);

    // https://en.wikipedia.org/wiki/Intel_HEX
    const checksum = () =>
        0x0100 - ((checksumTotal + dataBytes.length) & 0xff);

    const add = (bytes: PairOfBytes) => {
        checksumTotal = checksumTotal + bytes[0] + bytes[1];
        // Flip 'em over to make 'em big endian!
        dataBytes.push(hex(bytes[1], 2));
        dataBytes.push(hex(bytes[0], 2));
    };

    const asString = () => [
        ":",
        hex(dataBytes.length, 2), // usually 8, 16 or 32 some warez don't like 32
        hex(address, 4), // for > 64K use extended segment address
        dataRecordType,
        dataBytes.join(""),
        hex(checksum(), 2)
    ].join("");

    return {
        "add": add,
        "asString": asString
    };
};

export type HexRecord = ReturnType<typeof hexRecord>;
