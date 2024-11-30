import {
    box, failure, type Box, type Failure
} from "../value-or-failure.ts";
import {
    rawLine, type FileName, type LineNumber, type SourceCode
} from "../coupling/line.ts";

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

export const fileStack = (read: ReaderMethod) => {
    let fileStack: Array<StackEntry> = [];

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

    const includeFile = (fileName: FileName): Box<string> | Failure => {
        const contents = fileContents(fileName);
        if (contents.which == "failure") {
            return contents;
        }
        fileStack.push({"name": fileName, "iterator": contents.iterator});
        return box("");
    };

    const lines = function* (fileName: FileName) {
        fileStack = [];
        const topFile = includeFile(fileName);
        if (topFile.which == "failure") {
            yield rawLine(fileName, 0, "", [topFile]);
        }
        let file = currentFile();
        while (file != undefined) {
            const next = file.iterator.next();
            if (next.done) {
                fileStack.pop();
            } else {
                const [lineNumber, rawSource] = next.value;
                yield rawLine(file.name, lineNumber, rawSource, []);
            }
            // Bear in mind that another file could have been pushed on top
            // by an include directive "whilst we weren't watching"
            file = currentFile();
        }
    };

    return {
        "includeFile": includeFile,
        "lines": lines,
    };
};
