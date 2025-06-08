import { Code } from "./data-types.ts";

const isTwo = (pair: Readonly<Array<number>>): pair is Code => pair.length == 2;

export const asWords = (
    bytes: Array<number>, code: Array<Code>, flipBytes: boolean
) => {
    let words = 0;
    let pair: Array<number> = [];

    bytes.forEach((byte) => {
        if (flipBytes) {
            pair.unshift(byte);
        } else {
            pair.push(byte);
        }
        if (isTwo(pair)) {
            code.push(pair);
            words = words + 1;
            pair = [];
        }
    });
    if (pair.length == 1) {
        code.push([pair[0]!, 0]);
        words = words + 1;
    }
    return words;
};
