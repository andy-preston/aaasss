import type { OutputFile } from "../assembler/output-file.ts";
import type { Line } from "../line/line-types.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { ExtractedCode } from "./code.ts";
import type { FailureMessageTranslator } from "./languages.ts";
import type { ExtractedText } from "./text.ts";

import { codeWidth, extractedCode } from "./code.ts";
import { formattedSymbolTable } from "./symbols.ts";
import { extractedText } from "./text.ts";

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

    const messagesForLine = (line: Line) =>
        line.failures().reduce(
            (messages, failure) =>
                messages.concat(failureMessages(failure)),
            [] as Array<string>
        );

    const body = (code: ExtractedCode, text: ExtractedText) => {
        const pad = (text: string | undefined, width: number) =>
            (text == undefined ? "" : text).padEnd(width);

        while (true) {
            const nextCode = code.next();
            const nextText = text.next();
            if (nextCode.done && nextText.done) {
                return;
            }
            const codeColumn = pad(nextCode.value, codeWidth);
            const textColumn = pad(nextText.value, 0);
            file.write(`${codeColumn} ${textColumn}`.trimEnd());
        }
    };

    const line = (theLine: Line) => {
        fileName(theLine.fileName);
        const messages = messagesForLine(theLine);
        body(extractedCode(theLine), extractedText(theLine, messages));
    };

    const close = () => {
        const symbols = formattedSymbolTable(symbolTable);
        if (symbols.length > 0) {
            heading("Symbol Table");
            file.write("");
            symbols.forEach(symbol => file.write(symbol));
        };
        file.close();
    };

    return {
        "line": line,
        "close": close
    };
};

export type Listing = ReturnType<typeof listing>;
