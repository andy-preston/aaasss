import type { ReaderMethod } from "./reader.ts";

import { currentLine, emptyLine } from "../assembler/line.ts";
import { fileStack } from "./file-stack.ts";

export const testSystem = (readerMethod: ReaderMethod, topFileName: string) => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $fileStack = fileStack($currentLine, readerMethod, topFileName);
    return {
        "currentLine": $currentLine,
        "fileStack": $fileStack
    };
};
