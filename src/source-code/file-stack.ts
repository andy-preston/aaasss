import type { Pass } from "../assembler/data-types.ts";
import type { StringDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { StringsOrFailures } from "../failure/bags.ts";
import type { FileLineIterator, FileName, LineNumber } from "./data-types.ts";

import { emptyBag, stringsBag } from "../assembler/bags.ts";
import { bagOfFailures, clueFailure } from "../failure/bags.ts";
import { lineWithRawSource } from "./line-types.ts";

type StackEntry = {
    "fileName": FileName;
    "iterator": FileLineIterator;
};

export const defaultReaderMethod = (fileName: FileName) =>
    Deno.readTextFileSync(fileName).split("\n");

export type ReaderMethod = typeof defaultReaderMethod;

export const fileStack = (read: ReaderMethod, topFileName: FileName) => {
    const fileStack: Array<StackEntry> = [];
    let lineNumber: LineNumber = 0;

    const fileContents = (fileName: FileName): StringsOrFailures => {
        try {
            return stringsBag(read(fileName));
        }
        catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                return bagOfFailures([
                    clueFailure("file_notFound", error.message)
                ]);
            }
            throw error;
        }
    };

    const fileLineByLine = function*(lines: Array<string>): FileLineIterator {
        for (const [index, text] of lines.entries()) {
            // Real files provide a line number here!
            // but imaginary files just reuse this one without incrementing
            lineNumber = index + 1;
            yield [text, "", 0];
        }
    };

    const include = (fileName: FileName): DirectiveResult => {
        const contents = fileContents(fileName);
        if (contents.type == "failures") {
            return contents;
        }
        fileStack.push({
            "fileName": fileName,
            "iterator": fileLineByLine(contents.it)
        });
        return emptyBag();
    };

    const includeDirective: StringDirective = {
        "type": "stringDirective", "it": include
    };

    const currentFile = () => fileStack.at(-1);

    const pushImaginary = (iterator: FileLineIterator) => {
        const current = currentFile()!;
        fileStack.push({
            "fileName": current.fileName,
            "iterator": iterator
        });
    };

    const nextLine = (file: StackEntry) => {
        const next = file.iterator.next();
        if (next.done) {
            fileStack.pop();
            return undefined;
        } else {
            const [rawSource, macroName, macroCount] = next.value;
            return lineWithRawSource(
                file.fileName, lineNumber,
                rawSource, macroName, macroCount, false
            );
        }
    };

    const assemblyPipeline = function* (pass: Pass) {
        const dummyLine  = (isLast: boolean) =>
            lineWithRawSource(topFileName, 0, "", "", 0, isLast).withPass(pass);

        const topFile = include(topFileName);
        if (topFile.type == "failures") {
            yield dummyLine(false).withFailures(topFile.it);
            return;
        }
        while (true) {
            // Another file could have been pushed by an include directive
            // "whilst we weren't watching".
            const file = currentFile();
            if (file == undefined) {
                yield dummyLine(true);
                return;
            }
            const next = nextLine(file);
            if (next != undefined) {
                yield next.withPass(pass);
            }
        }
    };

    return {
        "includeDirective": includeDirective,
        "pushImaginary": pushImaginary,
        "assemblyPipeline": assemblyPipeline,
    };
};

export type FileStack = ReturnType<typeof fileStack>;
