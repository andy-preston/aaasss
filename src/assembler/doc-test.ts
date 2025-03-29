import { expect } from "jsr:@std/expect/expect";
import { existsSync } from "jsr:@std/fs/exists";
import { defaultDeviceFinder, defaultJsonLoader, type DeviceFileOperations } from "../device/device-file.ts";
import { deviceMocks } from "../device/device-file-mocks.ts";
import { mockFailureMessages } from "../listing/messages-mock.ts";
import { FileName } from "../source-code/data-types.ts";
import { defaultReaderMethod } from "../source-code/file-stack.ts";
import { coupling } from "./coupling.ts";
import { extensionSwap, type FileExtension } from "./output-file.ts";

const topFileName = "/var/tmp/demo.asm";

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

    const mockDevice = (spec: object) => {
        deviceFile = deviceMocks(spec);
    };

    const source = (lines: Array<string>) => {
        const theFile = Deno.openSync(
            topFileName,
            { create: true, write: true, truncate: true }
        );
        theFile.writeSync((new TextEncoder()).encode(lines.join("\n")));
        theFile.close();
    };

    const assemble = () => {
        const assembler = coupling(
            topFileName,
            defaultReaderMethod,
            mockFailureMessages,
            deviceFile
        );
        assembler();
    };

    return {
        "source": source,
        "mockUnsupportedDevice": mockDevice,
        "assemble": assemble
    };
};
