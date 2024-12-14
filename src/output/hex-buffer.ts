import { Code } from "../object-code/data-types.ts";

export type PairOfBytes = [number, number];

export const hexBuffer = () => {
    let buffer: Array<number> = [];
    // AVR Program Memory is word addressed. HEX files are byte addressed.
    let byteAddress = 0;

    const restartAt = (newByteAddress: number) => {
        if (buffer.length != 0) {
            throw new Error("Restarting HEX buffer without it being empty");
        }
        byteAddress = newByteAddress;
    };

    const pairs = function* () {
        let pairsToDeliver = Math.min(16, buffer.length) / 2;
        while (pairsToDeliver--) {
            byteAddress += 2;
            yield [buffer.shift()!, buffer.shift()!] as PairOfBytes;
        }
    };

    const add = (code: Code) => {
        buffer = buffer.concat(code);
    };

    const hasAtLeast = (wanted: number) =>
        wanted > 0 && buffer.length >= wanted;

    const isContinuous = (newAddress: number) =>
        newAddress == byteAddress + buffer.length;

    return {
        "restartAt": restartAt,
        "pairs": pairs,
        "add": add,
        "address": () => byteAddress,
        "hasAtLeast": hasAtLeast,
        "isContinuous": isContinuous
    };
};

export type HexBuffer = ReturnType<typeof hexBuffer>;
