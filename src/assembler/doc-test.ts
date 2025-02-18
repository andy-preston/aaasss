import { existsSync } from "fs/exists";
import { assert, assertEquals, assertFalse } from "assert";
import { defaultDeviceFinder, defaultJsonLoader, type DeviceFileOperations } from "../device/device-file.ts";
import { deviceMocks } from "../device/device-file-mocks.ts";
import { mockFailureMessages } from "../listing/messages-mock.ts";
import { FileName } from "../source-code/data-types.ts";
import { defaultReaderMethod } from "../source-code/file-stack.ts";
import { coupling } from "./coupling.ts";
import { extensionSwap, type FileExtension } from "./output-file.ts";

const topFileName = "/var/tmp/demo.asm";

export const assertNoFileExists = (extension: FileExtension) => {
    assertFalse(
        existsSync(extensionSwap(topFileName, extension)),
        `${extension} file should not exist`
    );
}

export const assertFileExists = (extension: FileExtension) => {
    assert(
        existsSync(extensionSwap(topFileName, extension)),
        `${extension} file should exist`
    );
}

export const assertFileContains = (
    extension: FileExtension, expected: Array<string>
) => {
    assertFileExists(extension);
    const contents = Deno.readTextFileSync(
        extensionSwap(topFileName, extension)
    ).split("\n");
    contents.pop();
    assertEquals(contents, expected);
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
