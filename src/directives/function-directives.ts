import type { CurrentLine } from "../line/current-line.ts";
import type { DirectiveResult } from "./data-types.ts";

import { complement, highByte, lowByte } from "../assembler/byte-operations.ts";
import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure } from "../failure/bags.ts";

export const functionDirectives = (currentLine: CurrentLine) => {

    const validWord = (word: number) => {
        const good = word >= 0 && word <= 0xffff;
        if (!good) {
            addFailure(currentLine().failures, assertionFailure(
                "parameter_value", "(word) 0-FFFF", `${word}`
            ));
        }
        return good;
    };

    const lowDirective = (word: number): DirectiveResult =>
        validWord(word) ? lowByte(word) : 0;

    const highDirective = (word: number): DirectiveResult =>
        validWord(word) ? highByte(word) : 0;

    const complementDirective = (value: number): DirectiveResult =>
        complement(value);

    return {
        "low": lowDirective,
        "high": highDirective,
        "complement": complementDirective
    };
};

export type FunctionDirectives = ReturnType<typeof functionDirectives>;
