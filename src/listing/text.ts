import { LineWithAddress } from "../program-memory/line-types.ts";

const lineNumberWidth = 4;

const textLine = (lineNumber: string, theText: string) =>
    `${lineNumber}`.padStart(lineNumberWidth, " ") + ` ${theText}`;

export const extractedText = function* (
    line: LineWithAddress, messages: Array<string>
) {
    yield textLine(
        `${line.lineNumber}`, line.rawSource || line.assemblySource
    );
    for (const message of messages) {
        yield textLine("", message);
    }
    return "";
};

export type ExtractedText = ReturnType<typeof extractedText>;

