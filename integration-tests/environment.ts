import { coupling } from "../src/coupling/coupling.ts";
import type { Failure } from "../src/failure/failures.ts";
import type { LineWithObjectCode } from "../src/object-code/line-types.ts";
import type { FileName } from "../src/source-code/data-types.ts";

export const testEnvironment = (source: Array<string>) => {

    const output: Map<string, Array<string>> = new Map();

    const mockFileReader = (_fileName: FileName) => source;

    const mockOutputFile = (_fileName: string, extension: string) => {
        let theText: Array<string> = [];
        const write = (text: string) => {
            theText.push(text);
        };
        const close = () => {
            if (theText.length > 0) {
                if (output.has(extension)) {
                    throw new Error(`Multiple ${extension} files created`);
                }
                output.set(extension, theText);
            }
            theText = [];
        };
        return {
            "write": write,
            "close": close
        };
    };

    const mockFailureMessages =
        (failure: Failure, _line: LineWithObjectCode) => [failure.kind];

    return {
        "pipeline": coupling(
            "mock.asm", mockFileReader, mockOutputFile, mockFailureMessages
        ),
        "listing": () => output.get(".lst"),
        "hexFile": () => output.get(".hex")
    };
};
