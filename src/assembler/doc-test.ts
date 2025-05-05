import type { DeviceFileOperations } from "../device/device-file.ts";
import type { FileExtension } from "./output-file.ts";

import { expect } from "jsr:@std/expect/expect";
import { existsSync } from "jsr:@std/fs/exists";
import { defaultDeviceFinder, defaultJsonLoader } from "../device/device-file.ts";
import { deviceMocks } from "../device/device-file-mocks.ts";
import { mockFailureMessages } from "../listing/languages-mock.ts";
import { FileName } from "../source-code/data-types.ts";
import { defaultReaderMethod } from "../source-code/file-stack.ts";
import { coupling } from "./coupling.ts";
import { extensionSwap } from "./output-file.ts";

const testFileDirectory = "/var/tmp/";
const topFileName = `${testFileDirectory}demo.asm`;

export const expectFileExists = (extension: FileExtension) => {
    const file = extensionSwap(topFileName, extension);
    return expect(existsSync(file), `File ${file} exists`);
};

export const expectFileContents = (extension: FileExtension) => {
    expectFileExists(extension).toBeTruthy();
    const contents = Deno.readTextFileSync(
        extensionSwap(topFileName, extension)
    ).split("\n");
    contents.pop();
    return expect(contents);
};

const cleanup = () => {
    const remove = (fileName: FileName) => {
        if (existsSync(fileName)) {
            Deno.removeSync(fileName);
        }
    };
    remove(topFileName);
    remove(extensionSwap(topFileName, ".lst"));
    remove(extensionSwap(topFileName, ".hex"));
};

export const docTest = () => {
    cleanup();

    let deviceFile: DeviceFileOperations =
        [defaultDeviceFinder, defaultJsonLoader];

    const mockUnsupportedDevice = (spec: object) => {
        deviceFile = deviceMocks(spec);
    };

    let defaultFileName = topFileName;

    const fileNameOrDefault = (fileName: FileName) => {
        if (fileName != "") {
            return `${testFileDirectory}${fileName}`;
        }

        if (defaultFileName == "") {
            throw new Error("Can only have one top/default file");
        }

        const useFileName = defaultFileName;
        defaultFileName = "";
        return useFileName;
    };

    const source = (fileName: FileName, lines: Array<string>) => {
        const theFile = Deno.openSync(
            fileNameOrDefault(fileName),
            { create: true, write: true, truncate: true }
        );
        theFile.writeSync((new TextEncoder()).encode(lines.join("\n")));
        theFile.close();
    };

    const assemble = () => {
        coupling(
            topFileName,
            defaultReaderMethod,
            mockFailureMessages,
            deviceFile
        )();
    };

    return {
        "source": source,
        "mockUnsupportedDevice": mockUnsupportedDevice,
        "assemble": assemble
    };
};
