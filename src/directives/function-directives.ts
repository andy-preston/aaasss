import { box } from "../failure/failure-or-box.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { Directive } from "./data-types.ts";

export const low: Directive = (word: unknown) => {
    const parameter = validNumeric(word, "type_word");
    return parameter.which == "failure"
        ? parameter
        : box(`${parameter.value & 0xff}`);
};

export const high: Directive = (word: unknown) => {
    const parameter = validNumeric(word, "type_word");
    return parameter.which == "failure"
        ? parameter
        : box(`${(parameter.value >> 8) & 0xff}`);
};
