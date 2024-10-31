import {
    rawLine,
    type FileName,
    type LineNumber,
    type SourceCode
} from "./line.ts";

type StackEntry = [FileName, IterableIterator<[LineNumber, SourceCode]>];

export const fileStack = () => {
    let fileStack: Array<StackEntry> = [];

    const stackEntry = (fileName: FileName): StackEntry => ([
        fileName,
        Deno.readTextFileSync(fileName).split("\n").entries()
    ]);

    const currentFile = (): StackEntry | undefined =>
        fileStack.length == 0 ? undefined : fileStack[fileStack.length - 1]

    const includeFile = (fileName: FileName) => {
        fileStack.push(stackEntry(fileName));
    };

    const lines = function* (fileName: FileName) {
        fileStack = [stackEntry(fileName)];
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
