import type { CurrentLine } from "../line/current-line.ts";

export const definitionList = (
    currentLine: CurrentLine
) => {
    const list: Map<string, string> = new Map();

    const reset = () => {
        list.clear();
    }

    const set = (symbolName: string) => {
        const line = currentLine.directiveBackdoor();
        if (line) {
            list.set(symbolName, `${line.fileName}:${line.lineNumber}`);
        }
    };

    const text = (symbolName: string, specialCase: string) => {
        const definition = list.get(symbolName);
        return definition != undefined ? definition : specialCase;
    };

    return {
        "reset": reset,
        "set": set,
        "text": text
    };
};
