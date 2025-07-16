import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { tokens } from "./tokens.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    return {
        "currentLine": $currentLine,
        "tokens": tokens($currentLine)
    };
};
