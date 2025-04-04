import { currentFileName, currentLineNumber } from "../directives/global-line.ts";

export const definitionList = () => {
    const list: Map<string, string> = new Map();

    const reset = () => {
        list.clear();
    }

    const set = (symbolName: string) => {
        const fileName = currentFileName();
        if (fileName) {
            list.set(symbolName, `${fileName}:${currentLineNumber()}`);
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
