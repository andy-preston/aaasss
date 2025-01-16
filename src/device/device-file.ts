import { existsSync } from "fs/exists";
import { box, failure } from "../failure/failure-or-box.ts";
import type { DeviceSpec, RawItems } from "./data-types.ts";

export const defaultDeviceFinder = (deviceName: string) => {
    const fileName = deviceName.replace(/[^\w]|_/g, "").toLowerCase();
    const baseName = `./devices/${fileName}.json`;
    return existsSync(baseName)
        ? box(baseName)
        : failure(undefined, "device_notFound", undefined);
};

export type DeviceFinder = typeof defaultDeviceFinder;

export const defaultJsonLoader = (name: string): RawItems | DeviceSpec =>
    JSON.parse(Deno.readTextFileSync(name));

export type JsonLoader = typeof defaultJsonLoader;

export type DeviceFileOperations = [DeviceFinder, JsonLoader];
