import type { Context } from "../context/context.ts";

import type { Mnemonic } from "../source-files/line.ts";

import {
    box, failure, type Box, type Failure
} from "../value-or-failure.ts";

import { cpuRegisters } from "./registers.ts";

import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const deviceProperties = (context: Context) => {
    let deviceName = "";
    let reducedCore = false;
    const unsupported = unsupportedInstructions();
    const registers = cpuRegisters(context);

    const name = (): Box<string> | Failure => deviceName == ""
        ? failure(undefined, "noDeviceSelected", undefined)
        : box(deviceName);

    const hasReducedCore = (): Box<boolean> | Failure => deviceName == ""
        ? failure(undefined, "noDeviceSelected", undefined)
        : box(reducedCore);

    const isUnsupported = (mnemonic: Mnemonic): Box<boolean> | Failure =>
        deviceName == ""
            ? failure(undefined, "noDeviceSelected", undefined)
            : box(unsupported.isUnsupported(mnemonic));

    const setReducedCore = (value: boolean) => {
        reducedCore = value;
    };

    const setDeviceName = (value: string) => {
        deviceName = value;
    };

    return {
        "setName": setDeviceName,
        "name": () => deviceName,
        "reducedCore": setReducedCore,
        "unsupportedInstructions": unsupported.choose,
        "registers": registers.choose,
        "public": {
            "name": name,
            "hasReducedCore": hasReducedCore,
            "isUnsupported": isUnsupported,
        },
    };
};

export type DeviceProperties = ReturnType<typeof deviceProperties>;
