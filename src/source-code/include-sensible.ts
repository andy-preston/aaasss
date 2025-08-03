import type { FileName, StackEntry } from "./data-types.ts";

import { dirname, extname, isAbsolute, normalize } from "jsr:@std/path";
import { boringFailure } from "../failure/bags.ts"
import { Failures } from "../failure/failures.ts";

export const includeSensible = (
    newName: FileName,
    currentFile: StackEntry | undefined,
    failures: Failures
): FileName => {
    if (currentFile == undefined) {
        if (extname(newName) != '.asm') {
            failures(boringFailure("file_topLevelAsm"));
            return "";
        }
        return newName;
    }

    if (extname(currentFile.fileName) == '.js') {
        failures(boringFailure("file_includeInJs"));
        return "";
    }

    return isAbsolute(newName) ? newName
        : normalize(`${dirname(currentFile.fileName)}/${newName}`);
};
