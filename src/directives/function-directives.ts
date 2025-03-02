import { box } from "../failure/failure-or-box.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { ObsoleteDirective } from "./data-types.ts";

const lowDirective: ObsoleteDirective = {
    "type": "directive",
    "body": (word: unknown) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.which == "failure"
            ? parameter
            : box(`${parameter.value & 0xff}`);
    }
};

const highDirective: ObsoleteDirective = {
    "type": "directive",
    "body": (word: unknown) => {
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
