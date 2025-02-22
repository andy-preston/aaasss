import type { OutputFile } from "../assembler/output-file.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { FailureMessageTranslator } from "./messages.ts";

const objectWidth = "00 00 00 00".length;
const addressWidth = 6;
const codeWidth = objectWidth + addressWidth + 1;
const lineNumberWidth = 4;
const displayableValues = ["number", "string"];

export const listing = (
    outputFile: OutputFile, topFileName: FileName,
    failureMessages: FailureMessageTranslator,
    symbolTable: SymbolTable
) => {
    const file = outputFile(topFileName, ".lst");
    let currentName = "";

    const heading = (text: string) => {
        if (!file.empty()) {
            file.write("");
        }
        file.write(text);
        file.write("=".repeat(text.length));
    };

    const fileName = (newName: FileName) => {
        if (newName != currentName) {
            heading(newName);
            currentName = newName;
        }
    };

    const extractedCode = function* (theLine: LineWithAddress) {
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

    const extractedText = function* (theLine: LineWithAddress) {
        const textLine = (lineNumber: string, theText: string) =>
            `${lineNumber}`.padStart(lineNumberWidth, " ") + ` ${theText}`;

        yield textLine(
            `${theLine.lineNumber}`,
            theLine.rawSource || theLine.assemblySource
        );
        for (const failure of theLine.failures()) {
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
                `${pad(nextCode.value, codeWidth)} ${pad(nextText.value, 0)}`.trimEnd()
            );
        }
    };

    const line = (theLine: LineWithAddress) => {
        fileName(theLine.fileName);
        body(extractedCode(theLine), extractedText(theLine));
    };

    const sortedSymbolTable = () => {
        const symbolList = symbolTable.list();
        if (symbolList.length == 0) {
            return;
        }

        const transform = (key: string) =>
            key.replace(/^R([0-9])$/, "R0$1").toUpperCase()

        const symbols = symbolList.sort(
            (a, b) => transform(a[0]).localeCompare(transform(b[0]))
        );

        heading("Symbol Table");
        file.write("");
        symbols.forEach(([symbolName, usageCount, symbolValue, definition]) => {
            const formatted = displayableValues.includes(typeof symbolValue)
                ? ` = ${symbolValue}`
                : "";
            file.write(
                `${symbolName}${formatted} (${usageCount}) ${definition}`.trim()
            );
        });
    };

    const close = () => {
        sortedSymbolTable();
        file.close();
    };

    return {
        "line": line,
        "close": close
    };
};

export type Listing = ReturnType<typeof listing>;
