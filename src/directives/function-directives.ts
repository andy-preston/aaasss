import { box } from "../failure/failure-or-box.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { NumberDirective } from "./data-types.ts";

const lowDirective: NumberDirective = {
    "type": "numberDirective",
    "body": (word: number) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.which == "failure"
            ? parameter
            : box(`${parameter.value & 0xff}`);
    }
};

const highDirective: NumberDirective = {
    "type": "numberDirective",
    "body": (word: number) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.which == "failure"
            ? parameter
            : box(`${(parameter.value >> 8) & 0xff}`);
    }
};

export const functionDirectives = {
    "lowDirective": lowDirective,
    "highDirective": highDirective
};
