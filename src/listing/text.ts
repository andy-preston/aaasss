import type { Line } from "../assembler/line.ts";

const lineNumberWidth = 4;

const textLine = (lineNumber: string, theText: string) =>
    `${lineNumber}`.padStart(lineNumberWidth, " ") + ` ${theText}`;

export const extractedText = function* (
    line: Line, messages: Array<string>
) {
    yield textLine(`${line.lineNumber}`, line.sourceCode);
    for (const message of messages) {
        yield textLine("", message);
    }
    return "";
};

export type ExtractedText = ReturnType<typeof extractedText>;
