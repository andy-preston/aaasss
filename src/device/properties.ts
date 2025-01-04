import { box, type Box } from "../coupling/boxed-value.ts";
import { failure, type Failure } from "../failure/failures.ts";
import type { Context } from "../javascript/context.ts";
import type { Mnemonic } from "../source-code/data-types.ts";
import { cpuRegisters } from "./registers.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const deviceProperties = (context: Context) => {
    let deviceName = "";
    let reducedCore = false;
    let programMemory = 0;
    let ramStart = 0;
    let ramEnd = 0;
    const unsupported = unsupportedInstructions();
    const registers = cpuRegisters(context);

    const name = (): Box<string> | Failure =>
        deviceName == ""
            ? failure(undefined, "device_notSelected", undefined)
            : box(deviceName);

    const hasReducedCore = (): Box<boolean> | Failure =>
        deviceName == ""
            ? failure(undefined, "device_notSelected", undefined)
            : box(reducedCore);

    const isUnsupported = (mnemonic: Mnemonic): Box<boolean> | Failure =>
        deviceName == ""
            ? failure(undefined, "mnemonic_supportedUnknown", undefined)
            : unsupported.isUnsupported(mnemonic)
            ? failure(undefined, "mnemonic_notSupported", undefined)
            : box(false);

    const programMemoryEnd = (address: number): Box<boolean> | Failure =>
        deviceName == ""
            ? failure(undefined, "programMemory_sizeUnknown", `${address}`)
            : address > programMemory
            ? failure(undefined, "programMemory_outOfRange", `${address}`)
            : box(false);

    const getRamAddress = (plusBytes: number): Box<number> | Failure => {
        const address = ramStart + plusBytes;
        return deviceName == ""
            ? failure(undefined, "ram_sizeUnknown", "")
            : address > ramEnd
            ? failure(undefined, "ram_outOfRange", "`${address}`")
            : box(address);
    };

    const setReducedCore = (value: boolean) => {
        reducedCore = value;
    };

    const setDeviceName = (value: string) => {
        deviceName = value;
    };

    const programMemoryBytes = (value: number) => {
        // Specified in bytes but used as words
        programMemory = value / 2;
    };

    const setRamStart = (value: number) => {
        ramStart = value;
    };

    const setRamEnd = (value: number) => {
        ramEnd = value;
    };

    return {
        "setName": setDeviceName,
        "name": () => deviceName,
        "reducedCore": setReducedCore,
        "unsupportedInstructions": unsupported.choose,
        "registers": registers.choose,
        "programMemoryBytes": programMemoryBytes,
        "ramStart": setRamStart,
        "ramEnd": setRamEnd,
        "public": {
            "name": name,
            "hasReducedCore": hasReducedCore,
            "isUnsupported": isUnsupported,
            "programMemoryEnd": programMemoryEnd,
            "ramAddress": getRamAddress
        },
    };
};

export type DeviceProperties = ReturnType<typeof deviceProperties>;
export type DevicePropertiesInterface = DeviceProperties["public"];
