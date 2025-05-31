import type { NumberDirective } from "./bags.ts";

import { stringBag } from "../assembler/bags.ts";
import { complement, highByte, lowByte } from "../assembler/byte-operations.ts";
import { validNumeric } from "../numeric-values/valid.ts";

const lowDirective: NumberDirective = {
    "type": "numberDirective",
    "it": (word: number) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.type == "failures"
            ? parameter
            : stringBag(`${lowByte(parameter.it)}`);
    }
};

const highDirective: NumberDirective = {
    "type": "numberDirective",
    "it": (word: number) => {
        const parameter = validNumeric(word, "type_word");
        return parameter.type == "failures"
            ? parameter
            : stringBag(`${highByte(parameter.it)}`);
    }
};

const complementDirective: NumberDirective = {
    "type": "numberDirective",
    "it": (value: number) => stringBag(`${complement(value)}`)
};

export const functionDirectives = {
    "lowDirective": lowDirective,
    "highDirective": highDirective,
    "complementDirective": complementDirective
};
