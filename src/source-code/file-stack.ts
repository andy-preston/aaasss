import type { StringDirective } from "../directives/data-types.ts";
import { box, emptyBox, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";
import { lineWithRawSource, type LineWithRawSource } from "./line-types.ts";

export type FileLineIterator =
    Generator<[SourceCode, string, number, boolean], void, unknown>;

type StackEntry = {
    "fileName": FileName;
    "iterator": FileLineIterator;
};

export type SourceOfSource = () => Generator<LineWithRawSource, void, void>;

export const defaultReaderMethod = (fileName: FileName) =>
    Deno.readTextFileSync(fileName).split("\n");

export type ReaderMethod = typeof defaultReaderMethod;

export const fileStack = (read: ReaderMethod, topFileName: FileName) => {
    const fileStack: Array<StackEntry> = [];
    let lineNumber: LineNumber = 0;

    const fileContents = (fileName: FileName): Box<Array<string>> | Failure => {
        try {
            return box(read(fileName));
        }
        catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "file_notFound", error);
            }
            throw error;
        }
    };

    const fileLineByLine = function*(lines: Array<string>): FileLineIterator {
        for (const [index, text] of lines.entries()) {
            // Real files provide a line number here!
            // but imaginary files just reuse this one without incrementing
            lineNumber = index + 1;
            const lastLine = fileStack.length == 1 && lineNumber == lines.length;
            yield [text, "", 0, lastLine];
        }
    };

    const includeDirective: StringDirective = {
        "type": "stringDirective",
        "body": (fileName: FileName) => {
            const contents = fileContents(fileName);
            if (contents.which == "failure") {
                return contents;
            }
            fileStack.push({
                "fileName": fileName,
                "iterator": fileLineByLine(contents.value)
            });
            return emptyBox();
        }
    };

    const currentFile = () => fileStack.at(-1);

    const pushImaginary = (iterator: FileLineIterator) => {
        const current = currentFile()!;
        fileStack.push({
            "fileName": current.fileName,
            "iterator": iterator
        });
    };

    const lines: SourceOfSource = function* () {
        const topFile = includeDirective.body(topFileName);
        if (topFile.which == "failure") {
            yield lineWithRawSource(
                topFileName, 0, "", "", 0, false
            ).withFailure(topFile);
        }
        let file = fileStack[0];
        while (file != undefined) {
            const next = file.iterator.next();
            if (next.done) {
                fileStack.pop();
            } else {
                const [rawSource, macroName, macroCount, lastLine] = next.value;
                yield lineWithRawSource(
                    file.fileName, lineNumber, rawSource,
                    macroName, macroCount, lastLine
                );
            }
            // Another file could have been pushed by an include directive
            // "whilst we weren't watching".
            file = currentFile();
        }
    };

    return {
        "includeDirective": includeDirective,
        "pushImaginary": pushImaginary,
        "lines": lines,
    };
};

export type FileStack = ReturnType<typeof fileStack>;
