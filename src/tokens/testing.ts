import { currentLine, emptyLine } from "../assembler/line.ts";
import { tokens } from "./tokens.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    return {
        "currentLine": $currentLine,
        "tokens": tokens($currentLine)
    };
};
