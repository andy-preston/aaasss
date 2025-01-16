import { box, failure } from "../failure/failure-or-box.ts";
import type { Directive } from "./data-types.ts";
import { numericParameter } from "./type-checking.ts";

export const maskToBitNumber: Directive = (mask: unknown) => {
    const parameter = numericParameter(mask, "type_byte");
    if (parameter.which == "failure") {
        return parameter;
    }
    for (const bitNumber of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        if (1 << bitNumber == parameter.value) {
            return box(`${bitNumber}`);
        }
    }
    return failure(undefined, "type_bitmask", `${mask}`);
};

export const low: Directive = (word: unknown) => {
    const parameter = numericParameter(word, "type_word");
    return parameter.which == "failure"
        ? parameter
        : box(`${parameter.value & 0xff}`);
};

export const high: Directive = (word: unknown) => {
    const parameter = numericParameter(word, "type_word");
    return parameter.which == "failure"
        ? parameter
        : box(`${(parameter.value >> 8) & 0xff}`);
};
