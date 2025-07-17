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

    const validSignedByte = (byte: number) => {
        const good = byte >= -128 && byte <= 127;
        if (!good) {
            addFailure(currentLine().failures, assertionFailure(
                "parameter_value", "(signed byte) (-128)-127", `${byte}`
            ));
        }
        return good;
    }

    const lowDirective = (word: number): DirectiveResult =>
        validWord(word) ? lowByte(word) : 0;

    const highDirective = (word: number): DirectiveResult =>
        validWord(word) ? highByte(word) : 0;

    const complementDirective = (byte: number): DirectiveResult =>
        validSignedByte(byte) ? complement(byte) : 0;

    return {
        "low": lowDirective,
        "high": highDirective,
        "complement": complementDirective
    };
};

export type FunctionDirectives = ReturnType<typeof functionDirectives>;
