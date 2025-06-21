import type { CurrentLine } from "../line/current-line.ts";
import type { NumberDirective } from "./bags.ts";

import { complement, highByte, lowByte } from "../assembler/byte-operations.ts";
import { addFailure } from "../failure/add-failure.ts";
import { range } from "./valid-parameters.ts";

export const functionDirectives = (currentLine: CurrentLine) => {
    const lowDirective: NumberDirective = {
        "type": "numberDirective",
        "it": (word: number) => {
            const invalid = range(word, "word", 1);
            if (invalid != undefined) {
                addFailure(currentLine().failures, invalid);
                return "0";
            }
            return `${lowByte(word)}`;
        }
    };

    const highDirective: NumberDirective = {
        "type": "numberDirective",
        "it": (word: number) => {
            const invalid = range(word, "word", 1);
            if (invalid != undefined) {
                addFailure(currentLine().failures, invalid);
                return "0";
            }
            return `${highByte(word)}`;
        }
    };

    const complementDirective: NumberDirective = {
        "type": "numberDirective",
        "it": (value: number) => `${complement(value)}`
    };

    return {
        "lowDirective": lowDirective,
        "highDirective": highDirective,
        "complementDirective": complementDirective
    };
};
