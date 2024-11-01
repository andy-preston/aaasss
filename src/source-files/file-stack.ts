import { contextValue, type ContextValue } from "../context/context.ts";
import { failure, type Failure } from "../failure.ts";
import {
    rawFailures, rawLine, type FileName, type LineNumber, type SourceCode
} from "./line.ts";

type FileIterator = ArrayIterator<[LineNumber, SourceCode]>;
type FileContents = {
    "which": "contents",
    "iterator": FileIterator
};
type StackEntry = [FileName, FileIterator];

export const fileStack = () => {
    let fileStack: Array<StackEntry> = [];

    const currentFile = (): StackEntry | undefined =>
        fileStack.length == 0 ? undefined : fileStack[fileStack.length - 1];

    const fileContents = (fileName: FileName): FileContents | Failure => {
        try {
            return {
                "which": "contents",
                "iterator": Deno.readTextFileSync(fileName).split("\n").entries()
            };
        }
        catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "notFound", error);
            }
            throw error;
        }
    }

    const includeFile = (fileName: FileName): ContextValue | Failure => {
        const contents = fileContents(fileName);
        if (contents.which == "failure") {
            return contents;
        }
        fileStack.push([fileName, contents.iterator]);
        return contextValue("");
    };

    const lines = function* (fileName: FileName) {
        fileStack = [];
        const topFile = includeFile(fileName);
        if (topFile.which == "failure") {
            yield rawFailures(rawLine(fileName, 0, ""), [topFile]);
        }
        let file = currentFile();
        while (file != undefined) {
            const next = file[1].next();
            if (next.done) {
                fileStack.pop();
            } else {
                const [lineNumber, rawSource] = next.value;
                yield rawLine(file[0], lineNumber, rawSource);
            }
            // Bear in mind that another file could have been pushed on top
            // by an include directive "whilst we weren't watching"
            file = currentFile();
        }
    };

    return {
        "includeFile": includeFile,
        "lines": lines
    };
};
