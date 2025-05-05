import type { LineWithTokens } from "../tokens/line-types.ts";
import type { MacroName } from "./data-types.ts";

import { lineWithRawSource } from "../source-code/line-types.ts";

export const removedDirective = (
    macroName: MacroName, line: LineWithTokens
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

    return lineWithRawSource(
        line.fileName, line.lineNumber,
        replaced, line.macroName, line.macroCount, false
    );
};
