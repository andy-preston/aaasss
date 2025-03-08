import { stringBag } from "../assembler/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { NumberDirective } from "./bags.ts";

const lowDirective: NumberDirective = {
    "type": "numberDirective",
    "it": (word: number) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.type == "failures"
            ? parameter
            : stringBag(`${parameter.it & 0xff}`);
    }
};

const highDirective: NumberDirective = {
    "type": "numberDirective",
    "it": (word: number) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.type == "failures"
            ? parameter
            : stringBag(`${(parameter.it >> 8) & 0xff}`);
    }
};

export const functionDirectives = {
    "lowDirective": lowDirective,
    "highDirective": highDirective
};
