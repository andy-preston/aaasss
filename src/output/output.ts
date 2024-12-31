import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { Pass } from "../pass/pass.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { OutputFile } from "./file.ts";
import { hexFile, type HexFile } from "./hex.ts";
import { listing } from "./listing.ts";
import type { FailureMessageTranslator } from "./messages.ts";

export const output = (
    pass: Pass,
    topFileName: FileName,
    outputFile: OutputFile,
    failureMessageTranslator: FailureMessageTranslator
) => {
    const listingFile = outputFile(topFileName, ".lst");
    const listingLine = listing(listingFile.write, failureMessageTranslator);
    let hex: HexFile | undefined = hexFile();

    const line = (line: LineWithObjectCode) => {
        if (pass.ignoreErrors()) {
            return;
        }
        listingLine(line);
        if (line.failed()) {
            hex = undefined;
        }
        hex?.line(line);
    };

    const close = () => {
        listingFile.close();
        if (hex) {
            const hexFile = outputFile(topFileName, ".hex");
            hex.save(hexFile.write);
            hexFile.close();
        }
    };

    return {
        "line": line,
        "close": close
    }
};

export type Output = ReturnType<typeof output>;
