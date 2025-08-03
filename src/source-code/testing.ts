import type { ReaderMethod } from "./reader.ts";

import { currentLine } from "../line/current-line.ts";
import { fileStack } from "./file-stack.ts";
import { emptyLine } from "../line/line-types.ts";

export const testSystem = (readerMethod: ReaderMethod, topFileName: string) => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $fileStack = fileStack($currentLine, readerMethod, topFileName);
    return {
        "currentLine": $currentLine,
        "fileStack": $fileStack
    };
};
