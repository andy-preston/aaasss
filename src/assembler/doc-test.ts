import { defaultDeviceFinder, defaultJsonLoader, type DeviceFileOperations } from "../device/device-file.ts";
import { deviceMocks } from "../device/device-file-mocks.ts";
import { mockFailureMessages } from "../listing/messages-mock.ts";
import { fileReaderMock } from "../source-code/file-reader-mock.ts";
import { coupling } from "./coupling.ts";
import { outputFileMock } from "./output-file-mock.ts";

export const docTest = () => {
    const source = fileReaderMock();
    const output = outputFileMock();
    let deviceFile: DeviceFileOperations =
        [defaultDeviceFinder, defaultJsonLoader];

    const mockDevice = (spec: object) => {
        deviceFile = deviceMocks(spec);
    };

    const assemble = () => {
        const assembler = coupling(
            "demo.asm",
            source.mockReaderMethod,
            output.outputFile,
            mockFailureMessages,
            deviceFile
        );
        assembler();
    };

    return {
        "source": source.addSourceCode,
        "mockUnsupportedDevice": mockDevice,
        "assemble": assemble,
        "assertFileExists": output.assertFileExists,
        "assertNoFileExists": output.assertNoFileExists,
        "assertFileContains": output.assertFileContains
    };
};
