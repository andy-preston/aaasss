import type { DeviceSpec, SpecItems } from "../device/data-types.ts";
import type { DeviceFileOperations } from "../device/file.ts";

import { coupling } from "../assembler/coupling.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "../device/file.ts";
import { mockFailureMessages } from "../listing/testing.ts";
import { defaultReaderMethod } from "../source-code/reader.ts";

export const assembler = () => {
    let deviceFile: DeviceFileOperations =
        [defaultDeviceFinder, defaultTomlLoader];

    const mockUnsupportedDevice = (spec: object) => {
        deviceFile = [
            (name: string) => name,
            (_fileName: string): DeviceSpec => ({ "spec": spec as SpecItems })
        ];
    };

    const assemble = (topFileName: string) => {
        coupling(
            topFileName,
            defaultReaderMethod, mockFailureMessages, deviceFile,
            false
        );
    };

    return {
        "mockUnsupportedDevice": mockUnsupportedDevice,
        "assemble": assemble
    };
};
