import type { CurrentLine } from "../assembler/line.ts";

export const definitionList = (currentLine: CurrentLine) => {
    const list: Map<string, string> = new Map();

    const reset = () => {
        list.clear();
    }

    const set = (symbolName: string) => {
        if (currentLine()) {
            const definition =
                `${currentLine().fileName}:${currentLine().lineNumber}`;
            list.set(symbolName, definition);
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
