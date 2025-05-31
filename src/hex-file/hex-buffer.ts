import type { Code } from "../object-code/data-types.ts";

export const hexBuffer = () => {
    let buffer: Array<number> = [];
    // AVR Program Memory is word addressed. HEX files are byte addressed.
    let byteAddress = 0;

    const restartAt = (newByteAddress: number) => {
        if (buffer.length > 0) {
            throw new Error("Restarting HEX buffer without it being empty");
        }
        byteAddress = newByteAddress;
    };

    const someBytes = () => {
        const result = buffer.slice(0, 16);
        buffer = buffer.slice(16);
        byteAddress = byteAddress + result.length;
        return result;
    };

    const add = (code: Code) => {
        buffer.push(code[0]);
        buffer.push(code[1]);
    };

    const hasAtLeast = (wanted: number) =>
        wanted > 0 && buffer.length >= wanted;

    const isContinuous = (newAddress: number) =>
        newAddress == byteAddress + buffer.length;

    return {
        "restartAt": restartAt,
        "someBytes": someBytes,
        "add": add,
        "address": () => byteAddress,
        "hasAtLeast": hasAtLeast,
        "isContinuous": isContinuous
    };
};

export type HexBuffer = ReturnType<typeof hexBuffer>;
