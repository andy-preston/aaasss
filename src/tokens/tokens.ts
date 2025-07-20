import type { PipelineProcess } from "../assembler/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure, clueFailure } from "../failure/bags.ts";

const anyWhitespace = /\s+/g;
const comment = /;.*$/;
const validLabel = /^\w*$/;
const registerName = /^r\d{1,2}$/;
const indexRegisterWord = /^\+?[xyz]\+?$/;
const indexRegisterByte = /^[xyz][hl]$/i;

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

const isRegister = (operand: string) =>
    operand.match(registerName) != null
        || operand.match(indexRegisterWord) != null
        || operand.match(indexRegisterByte) != null;

export const tokens = (currentLine: CurrentLine): PipelineProcess => () => {

    const operands = (text: string): Array<string> => {
        const operands: Array<string> = [];
        let parentheses = 0;
        let characters: Array<string> = [];
        let trailingComma = false;

        const operandDone = () => {
            const operand = characters.join("").trim();
            operands.push(
                isRegister(operand) ? operand.toUpperCase() : operand
            );
            characters = [];
        };

        text.split("").forEach(character => {
            if (character != "," || parentheses > 0) {
                trailingComma = false;
                characters.push(character);
            }
            if (character == "(") {
                parentheses = parentheses + 1;
            }
            if (character == ")") {
                parentheses = parentheses - 1;
            }
            if (character == "," && parentheses == 0) {
                trailingComma = true;
                operandDone();
            }
        });
        if (parentheses != 0) {
            addFailure(currentLine().failures, clueFailure(
                "syntax_parenthesesNesting", `${parentheses}`
            ));
            return [];
        }

        if (characters.length > 0 || trailingComma) {
            operandDone();
        };
        return operands;
    };

    if (currentLine().fileName.endsWith(".js")) {
        return;
    }

    const cleaned = clean(currentLine().sourceCode);

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
