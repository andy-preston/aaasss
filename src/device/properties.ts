import type { Context } from "../context/context.ts";

import type { Mnemonic } from "../coupling/line.ts";

import {
    box, failure, Failures, type Box, type Failure
} from "../value-or-failure.ts";

import { cpuRegisters } from "./registers.ts";

import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const deviceProperties = (context: Context) => {
    let deviceName = "";
    let reducedCore = false;
    let programMemory = 0;
    const unsupported = unsupportedInstructions();
    const registers = cpuRegisters(context);

    const name = (): Box<string> | Failure => deviceName == ""
        ? failure(undefined, "device.notSelected", undefined)
        : box(deviceName);

    const hasReducedCore = (): Box<boolean> | Failure => deviceName == ""
        ? failure(undefined, "device.notSelected", undefined)
        : box(reducedCore);

    const isUnsupported = (mnemonic: Mnemonic): Failures =>
        deviceName == "" ? [
            failure(undefined, "device.notSelected", undefined),
            failure(undefined, "mnemonic.supportedUnknown", undefined)
        ] : unsupported.isUnsupported(mnemonic) ? [
            failure(undefined, "mnemonic.notSupported", undefined)
        ] : [];
    const programMemoryEnd = (address: number): Box<boolean> | Failure =>
        deviceName == ""
            ? failure(undefined, "programMemory.sizeUnknown", `${address}`)
            : address > programMemory
            ? failure(undefined, "programMemory.outOfRange", `${address}`)
            : box(false);

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

    return {
        "setName": setDeviceName,
        "name": () => deviceName,
        "reducedCore": setReducedCore,
        "unsupportedInstructions": unsupported.choose,
        "registers": registers.choose,
        "programMemoryBytes": programMemoryBytes,
        "public": {
            "name": name,
            "hasReducedCore": hasReducedCore,
            "isUnsupported": isUnsupported,
            "programMemoryEnd": programMemoryEnd
        },
    };
};

export type DeviceProperties = ReturnType<typeof deviceProperties>;
export type DevicePropertiesInterface = DeviceProperties["public"];
