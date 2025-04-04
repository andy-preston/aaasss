import type { LineWithRawSource } from "../source-code/line-types.ts";

export const definitionList = () => {
    const list: Map<string, string> = new Map();
    let currentPosition: string = "";

    const reset = () => {
        list.clear();
    }

    const definingLine = (line: LineWithRawSource) => {
        currentPosition = `${line.fileName}:${line.lineNumber}`;
    };

    const set = (symbolName: string) => {
        if (currentPosition) {
            list.set(symbolName, currentPosition);
        }
    };

    const text = (symbolName: string, specialCase: string) => {
        const definition = list.get(symbolName);
        return definition != undefined ? definition : specialCase;
    };

    return {
        "reset": reset,
        "set": set,
        "text": text,
        "definingLine": definingLine
    };
};
