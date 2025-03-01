import { box } from "../failure/failure-or-box.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { Directive } from "./data-types.ts";

const low = (word: number) => {
    const parameter = validNumeric(word, "type_word");
    return parameter.which == "failure"
        ? parameter
        : box(`${parameter.value & 0xff}`);
};

const lowDirective: Directive = {
    "parametersType": "number",
    "method": low
};

const high = (word: unknown) => {
    const parameter = validNumeric(word, "type_word");
    return parameter.which == "failure"
        ? parameter
        : box(`${(parameter.value >> 8) & 0xff}`);
};

const highDirective: Directive = {
    "parametersType": "number",
    "method": high
};

export const functionDirectives = {
    "lowDirective": lowDirective,
    "highDirective": highDirective
};
