import type { NumberDirective } from "./bags.ts";
import { stringBag } from "../assembler/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";

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

const complementDirective: NumberDirective = {
    "type": "numberDirective",
    "it": (value: number) => stringBag(`${value < 0 ? 0x0100 + value : value}`)
};

export const functionDirectives = {
    "lowDirective": lowDirective,
    "highDirective": highDirective,
    "complementDirective": complementDirective
};
