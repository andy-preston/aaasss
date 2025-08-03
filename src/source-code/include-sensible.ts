import type { Failure } from "../failure/bags.ts";
import type { FileName, StackEntry } from "./data-types.ts";

import { dirname, extname, isAbsolute, normalize } from "jsr:@std/path";
import { boringFailure } from "../failure/bags.ts"
import { addFailure } from "../failure/add-failure.ts";

export const includeSensible = (
    newName: FileName,
    currentFile: StackEntry | undefined,
    failures: Array<Failure>
): FileName => {
    if (currentFile == undefined) {
        if (extname(newName) != '.asm') {
            addFailure(failures, boringFailure("file_topLevelAsm"));
            return "";
        }
        return newName;
    }

    if (extname(currentFile.fileName) == '.js') {
        addFailure(failures, boringFailure("file_includeInJs"));
        return "";
    }

    return isAbsolute(newName) ? newName
        : normalize(`${dirname(currentFile.fileName)}/${newName}`);
};
