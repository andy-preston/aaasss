import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { OutputFile } from "../pipeline/output-file.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { FailureMessageTranslator } from "./messages.ts";

const objectWidth = "00 00 00 00".length;
const addressWidth = 5;
const codeWidth = objectWidth + addressWidth + 1;
const lineNumberWidth = 4;

export const listing = (
    outputFile: OutputFile, topFileName: FileName,
    failureMessages: FailureMessageTranslator
) => {
    const file = outputFile(topFileName, ".lst");
    let currentName = "";

    const fileName = (newName: FileName) => {
        if (newName != currentName) {
            if (currentName != "") {
                file.write("");
            }
            file.write(newName);
            file.write("=".repeat(newName.length));
            file.write("");
            currentName = newName;
        }
    };

    const extractedCode = function* (theLine: LineWithObjectCode) {
        let address = theLine.address;
        for (const block of theLine.code) {
            const addressHex = address
                .toString(16)
                .toUpperCase()
                .padStart(addressWidth, "0");
            const object = block
                .map(byte => byte.toString(16).padStart(2, "0"))
                .join(" ")
                .toUpperCase()
                .padEnd(objectWidth, " ");
            yield `${addressHex} ${object}`;
            address = address + (block.length / 2);
        }
        return "";
    };

    type ExtractedCode = ReturnType<typeof extractedCode>;

    const extractedText = function* (theLine: LineWithObjectCode) {
        const textLine = (lineNumber: string, theText: string) =>
            `${lineNumber}`.padStart(lineNumberWidth, " ") + ` ${theText}`;

        yield textLine(
            `${theLine.lineNumber}`,
            theLine.rawSource || theLine.assemblySource
        );
        for (const failure of theLine.failures) {
            for (const message of failureMessages(failure, theLine)) {
                yield textLine("", message);
            }
        }
        return "";
    };

    type ExtractedText = ReturnType<typeof extractedText>;

    const body = (code: ExtractedCode, text: ExtractedText) => {
        const pad = (text: string | undefined, width: number) =>
            (text == undefined ? "" : text).padEnd(width);

        while (true) {
            const nextCode = code.next();
            const nextText = text.next();
            if (nextCode.done && nextText.done) {
                return;
            }
            file.write(
                pad(nextCode.value, codeWidth) + " " + pad(nextText.value, 0)
            );
        }
    };

    const line = (theLine: LineWithObjectCode) => {
        fileName(theLine.fileName);
        body(extractedCode(theLine), extractedText(theLine));
    };

    return {
        "line": line,
        "close": file.close
    };
};

export type Listing = ReturnType<typeof listing>;
