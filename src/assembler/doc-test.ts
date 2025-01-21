import { existsSync } from "fs/exists";
import { assert, assertEquals, assertFalse } from "assert";
import { defaultDeviceFinder, defaultJsonLoader, type DeviceFileOperations } from "../device/device-file.ts";
import { deviceMocks } from "../device/device-file-mocks.ts";
import { mockFailureMessages } from "../listing/messages-mock.ts";
import { fileReaderMock } from "../source-code/file-reader-mock.ts";
import { coupling } from "./coupling.ts";
import { extensionSwap, type FileExtension } from "./output-file.ts";
import { FileName } from "../source-code/data-types.ts";

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
    const source = fileReaderMock();
    let deviceFile: DeviceFileOperations =
        [defaultDeviceFinder, defaultJsonLoader];

    const mockDevice = (spec: object) => {
        deviceFile = deviceMocks(spec);
    };

    const assemble = () => {
        const assembler = coupling(
            topFileName,
            source.mockReaderMethod,
            mockFailureMessages,
            deviceFile
        );
        assembler();
    };

    return {
        "source": source.addSourceCode,
        "mockUnsupportedDevice": mockDevice,
        "assemble": assemble
    };
};
