import type { Directive } from "../context/context.ts";
import { stringParameter } from "../coupling/type-checking.ts";
import { box, failure, type Failure } from "../coupling/value-failure.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";
import { lineWithRawSource } from "./line-types.ts";

type FileIterator = ArrayIterator<[LineNumber, SourceCode]>;
type FileContents = {
    "which": "contents";
    "iterator": FileIterator;
};
type StackEntry = {
    "name": FileName;
    "iterator": FileIterator;
};

export type ReaderMethod = typeof Deno.readTextFileSync;

export const fileStack = (read: ReaderMethod, topFileName: FileName) => {
    const fileStack: Array<StackEntry> = [];

    const currentFile = (): StackEntry | undefined =>
        fileStack.length == 0 ? undefined : fileStack[fileStack.length - 1];

    const fileContents = (fileName: FileName): FileContents | Failure => {
        try {
            return {
                "which": "contents",
                "iterator": read(fileName).split("\n").entries(),
            };
        }
        catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "file.notFound", error);
            }
            throw error;
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
        fileStack.push({"name": fileName, "iterator": contents.iterator});
        return box("");
    };

    const lines = function* () {
        const topFile = include(topFileName);
        if (topFile.which == "failure") {
            yield lineWithRawSource(topFileName, 0, "", [topFile]);
        }
        let file = currentFile();
        while (file != undefined) {
            const next = file.iterator.next();
            if (next.done) {
                fileStack.pop();
            } else {
                const [lineNumber, rawSource] = next.value;
                yield lineWithRawSource(file.name, lineNumber, rawSource, []);
            }
            // Bear in mind that another file could have been pushed on top
            // by an include directive "whilst we weren't watching"
            file = currentFile();
        }
    };

    return {
        "include": include,
        "lines": lines,
    };
};

export type FileStack = ReturnType<typeof fileStack>;
