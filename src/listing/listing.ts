import type { PipelineSink } from "../assembler/data-types.ts";
import type { OutputFile } from "../assembler/output-file.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { ExtractedCode } from "./code.ts";
import type { FailureMessageTranslator } from "./languages.ts";
import type { ExtractedText } from "./text.ts";

import { codeWidth, extractedCode } from "./code.ts";
import { formattedSymbolTable } from "./symbols.ts";
import { extractedText } from "./text.ts";

export const listing = (
    currentLine: CurrentLine,
    outputFile: OutputFile, topFileName: FileName,
    failureMessages: FailureMessageTranslator,
    symbolTable: SymbolTable
): PipelineSink => {
    const file = outputFile(topFileName, ".lst");
    let currentName = "";

    const heading = (text: string) => {
        if (!file.empty()) {
            file.write("");
        }
        file.write(text);
        file.write("=".repeat(text.length));
    };

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

    const line = () => {
        if (currentLine().fileName != currentName) {
            currentName = currentLine().fileName;
            heading(currentName);
        }
        const messages = currentLine().failures.reduce(
            (messages, failure) =>
                messages.concat(failureMessages(failure)),
            [] as Array<string>
        );
        body(
            extractedCode(currentLine()),
            extractedText(currentLine(), messages)
        );
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
