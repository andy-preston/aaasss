import type { Directive } from "../context/context.ts";
import { box, type Box } from "../coupling/boxed-value.ts";
import { stringParameter } from "../directives/type-checking.ts";
import { failure, type Failure } from "../failure/failures.ts";
import type { PipelineSource } from "../pipeline/pipeline.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";
import { lineWithRawSource } from "./line-types.ts";

type FileLineIterator =
    Generator<[LineNumber, SourceCode, boolean], void, unknown>;

type StackEntry = {
    "name": FileName;
    "iterator": FileLineIterator;
};

export const defaultReaderMethod = (fileName: FileName) =>
    Deno.readTextFileSync(fileName).split("\n");

export type ReaderMethod = typeof defaultReaderMethod;

export const fileStack = (read: ReaderMethod, topFileName: FileName) => {
    const fileStack: Array<StackEntry> = [];

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

    const fileLineByLine = function*(lines: Array<string>): FileLineIterator  {
        for (const [index, text] of lines.entries()) {
            const lineNumber = index + 1;
            const lastLine = fileStack.length == 1 && lineNumber == lines.length;
            yield [lineNumber, text, lastLine];
        }
    };

    const include: Directive = (fileName: FileName) => {
        const check = stringParameter(fileName);
        if (check.which == "failure") {
            return check;
        }
        const contents = fileContents(fileName);
        if (contents.which == "failure") {
            return contents;
        }
        fileStack.push({
            "name": fileName,
            "iterator": fileLineByLine(contents.value)
        });
        return box("");
    };

    const lines: PipelineSource = function* () {
        const topFile = include(topFileName);
        if (topFile.which == "failure") {
            const failingLine = lineWithRawSource(topFileName, 0, false, "");
            failingLine.addFailures([topFile]);
            yield failingLine;
        }
        let file = fileStack[0];
        while (file != undefined) {
            const next = file.iterator.next();
            if (next.done) {
                fileStack.pop();
            } else {
                const [lineNumber, rawSource, lastLine] = next.value;
                yield lineWithRawSource(
                    file.name, lineNumber, lastLine, rawSource
                );
            }
            // Another file could have been pushed by an include directive
            // "whilst we weren't watching". Always read from the file that's
            // on the top of the stack.
            file = fileStack.at(-1);
        }
    };

    return {
        "include": include,
        "lines": lines,
    };
};

export type FileStack = ReturnType<typeof fileStack>;
