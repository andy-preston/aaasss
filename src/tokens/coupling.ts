import type { PipelineProcess } from "../assembler/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure } from "../failure/bags.ts";
import { operands } from "./operands.ts";

const anyWhitespace = /\s+/g;
const comment = /;.*$/;
const validLabel = /^\w*$/;

const clean = (sourceLine: string) =>
    sourceLine.replace(comment, "").replace(anyWhitespace, " ").trim();

const splitSource = (
    keep: "before" | "after", marker: string, raw: string
): [string, string] => {
    const position = raw.indexOf(marker);
    if (position == -1) {
        return keep == "before" ? [raw.trim(), ""] : ["", raw.trim()];
    }

    return [
        raw.substring(0, position).trim(),
        raw.substring(position + 1).trim()
    ];
};

export const tokensCoupling = (
    currentLine: CurrentLine
): PipelineProcess => () => {
    const cleaned = clean(currentLine().assemblySource);

    const [label, withoutLabel] = splitSource("after", ":", cleaned);
    if (validLabel.test(label)) {
        currentLine().label = label;
    } else {
        addFailure(currentLine().failures, boringFailure(
            "syntax_invalidLabel"
        ));
    }

    const mnemonicAndOperands: [string, string] =
        withoutLabel.charAt(0) == "."
            ? [".", withoutLabel.substring(1).trim()]
            : splitSource("before", " ", withoutLabel);

    const mnemonic = mnemonicAndOperands[0].toUpperCase();

    const mnemonicIsValid = ["", "."].includes(mnemonic)
        || mnemonic.match("^[A-Z]+$");

    if (mnemonicIsValid) {
        currentLine().mnemonic = mnemonic;
    } else {
        addFailure(currentLine().failures, boringFailure(
            "syntax_invalidMnemonic"
        ));
    }

    currentLine().operands = operands(mnemonicAndOperands[1]);
};
