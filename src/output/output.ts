import type { Failure } from "../coupling/value-failure.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { Pass } from "../pass/pass.ts";
import type { FileName } from "../source-code/data-types.ts";
import { file } from "./file.ts";
import { listing } from "./listing.ts";

export const output = (pass: Pass, topFileName: FileName) => {
    const listingFile = file(topFileName, ".lst");
    const listingLine = listing(listingFile.write);

    const line = (line: LineWithObjectCode) => {
        if (pass.showErrors()) {
            listingLine(line);
        }
    };

    const final = (failures: Array<Failure>) => {
        if (pass.showErrors()) {
            failures.forEach(failure => console.log(failure));
            listingFile.close();
        }
    };

    return {
        "line": line,
        "final": final
    }
};

export type Output = ReturnType<typeof output>;
