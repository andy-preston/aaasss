import type { Code } from "./data-types.ts";

const isTwo = (pair: Readonly<Array<number>>): pair is Code =>
    pair.length == 2;

export const codeAsWords = function* (
    bytes: IteratorObject<number>
): Generator<Code, void, void> {
    let pair: Array<number> = [];
    for (const byte of bytes) {
        pair.push(byte);
        if (isTwo(pair)) {
            yield pair;
            pair = [];
        }
    }
    if (pair.length == 1) {
        yield [pair[0]!, 0];
    }
};
