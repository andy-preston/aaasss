import type { Line } from "../line/line-types.ts";
import type { MacroName } from "./data-types.ts";

import { emptyLine } from "../line/line-types.ts";

export const removedDirective = (
    macroName: MacroName, line: Line
) => {
    const defineDirective = new RegExp(`macro\\s*\\(\\s*"${macroName}".*\\)\\s*;*`);
    const emptyMoustaches = /\s*{{\s*}}\s*/;
    const replaced = line.rawSource.replace(
        defineDirective, ""
    ).replace(
        emptyMoustaches, ""
    );

    if (replaced == line.rawSource) {
        return line;
    }

    if (replaced.trim() == "" && line.rawSource.trim() != "") {
        return undefined;
    }

    const newLine = emptyLine(line.fileName);
    newLine.lineNumber = line.lineNumber;
    newLine.rawSource = replaced;
    newLine.macroName = line.macroName;
    newLine.macroCount = line.macroCount;
    return newLine;
};
