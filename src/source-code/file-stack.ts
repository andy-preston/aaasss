import type { PipelineProcess, PipelineSource } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { FileLineIterator, FileName, LineNumber, StackEntry } from "./data-types.ts";
import type { ReaderMethod } from "./reader.ts";

import { emptyLine } from "../assembler/line.ts";
import { addFailure } from "../failure/add-failure.ts";
import { clueFailure } from "../failure/bags.ts";
import { includeSensible } from "./include-sensible.ts";

export const fileStack = (
    currentLine: CurrentLine, read: ReaderMethod, topFileName: FileName
) => {
    const fileStack: Array<StackEntry> = [];
    let lineNumber: LineNumber = 0;

    const fileLineByLine = function*(lines: Array<string>): FileLineIterator {
        for (const [index, text] of lines.entries()) {
            // Real files provide a line number here!
            // but imaginary files just reuse this one without incrementing
            lineNumber = index + 1;
            yield [text, "", lineNumber == lines.length];
        }
    };

    const fileContents = (fileName: FileName) => {
        try {
            return read(fileName);
        }
        catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                addFailure(currentLine().failures, clueFailure(
                    "file_notFound", error.message
                ));
                return;
            }
            throw error;
        }
    };

    const include = (fileName: FileName): DirectiveResult => {
        const fullName = includeSensible(
            fileName, currentFile(), currentLine().failures
        );
        if (fullName == "") {
            return undefined;
        }

        const contents = fileContents(fullName);
        if (contents == undefined) {
            return undefined;
        }

        fileStack.push({
            "fileName": fullName,
            "iterator": fileLineByLine(contents)
        });
        return undefined;
    };

    // Another file could have been pushed by an include directive
    // "whilst we weren't watching".
    const currentFile = () => fileStack.at(-1);

    const pushImaginary = (iterator: FileLineIterator) => {
        fileStack.push({
            "fileName": currentFile() == undefined
                ? topFileName : currentFile()!.fileName,
            "iterator": iterator
        });
    };

    const nextLine = () => {
        while (currentFile() != undefined) {
            const next = currentFile()!.iterator.next();
            if (next.done) {
                fileStack.pop();
            } else {
                return next.value;
            }
        }
        return undefined;
    };

    const lines: PipelineSource = (
        eachLine: PipelineProcess, atEnd: PipelineProcess
    ) => {
        currentLine(emptyLine(topFileName));
        include(topFileName);
        if (currentLine().failures.length > 0) {
            eachLine();
            atEnd();
            return;
        }

        while (true) {
            const next = nextLine();
            if (next == undefined) {
                currentLine(emptyLine(topFileName));
                atEnd();
                return;
            }
            currentLine(emptyLine(currentFile()!.fileName));
            [
                currentLine().sourceCode,
                currentLine().symbolSuffix,
                currentLine().eof
            ] = next;
            currentLine().lineNumber = lineNumber;
            eachLine();
        }
    };

    return {
        "include": include, "pushImaginary": pushImaginary, "lines": lines
    };
};

export type FileStack = ReturnType<typeof fileStack>;
