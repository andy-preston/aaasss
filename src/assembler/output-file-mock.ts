import { assert, assertEquals } from "assert";
import { FileExtension } from "./output-file.ts";

type FileContents = Array<string>;

export const outputFileMock = () => {
    const mockFiles: Map<FileExtension, FileContents> = new Map();

    const assertFileExists = (extension: FileExtension) => {
        assert(mockFiles.has(extension), `no ${extension} file saved`);
    };

    const assertNoFileExists = (extension: FileExtension) => {
        assert(!mockFiles.has(extension), `unexpected ${extension} file exists`);
    };

    const assertFileContains = (
        extension: FileExtension, expected: FileContents
    ) => {
        assertFileExists(extension);
        assertEquals(mockFiles.get(extension), expected);
    };

    const outputFile = (_topFileName: string, extension: FileExtension) => {
        let theText: FileContents = [];

        const remove = () => {
            theText = [];
            if (mockFiles.has(extension)) {
                mockFiles.delete(extension);
            }
        };

        const write = (text: string) => {
            theText.push(text);
        };

        const close = () => {
            if (theText.length > 0) {
                if (mockFiles.has(extension)) {
                    throw new Error(`Multiple ${extension} files created`);
                }
                mockFiles.set(extension, theText);
            }
            theText = [];
        };

        return {
            "remove": remove,
            "write": write,
            "close": close
        };
    };

    return {
        "assertFileExists": assertFileExists,
        "assertNoFileExists": assertNoFileExists,
        "assertFileContains": assertFileContains,
        "outputFile": outputFile
    };
};
