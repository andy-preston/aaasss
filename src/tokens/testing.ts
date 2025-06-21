import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { tokens } from "./assembly-pipeline.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $tokens = tokens($currentLine);
    return {
        "currentLine": $currentLine,
        "tokens": $tokens
    };
};
