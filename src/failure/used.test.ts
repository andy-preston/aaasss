import { expect } from "jsr:@std/expect";
import { walkSync } from "jsr:@std/fs/walk";
import { failureKinds } from "./kinds.ts";

const found = (kind: string) => {
    const sourceFiles = walkSync("./src/", {
        "includeDirs": false,
        "exts": ["ts"],
        "skip": [
            /.test.ts$/, /testing.ts$/,
            /src\/failure/, /src\/listing/
        ],
    });
    for (const sourceFile of sourceFiles) {
        if (Deno.readTextFileSync(sourceFile.path).indexOf(kind) != -1) {
            return true;
        }
    }
    return false;
};

Object.entries(failureKinds).flatMap(
    ([_key, failures]) => failures
).forEach(kind => Deno.test(`Failure "${kind}" is used`, () => {
    expect(found(kind)).toBe(true);
}));
