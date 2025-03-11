import { existsSync } from "fs/exists";
import { stringBag } from "../assembler/bags.ts";
import { bagOfFailures, clueFailure, type StringOrFailures } from "../failure/bags.ts";
import type { DeviceSpec, RawItems } from "./data-types.ts";

export const defaultDeviceFinder = (deviceName: string): StringOrFailures => {
    const fileName = deviceName.replace(/[^\w]|_/g, "").toLowerCase();
    const baseName = `./devices/${fileName}.json`;
    return existsSync(baseName)
        ? stringBag(baseName)
        : bagOfFailures([clueFailure("device_notFound", baseName)]);
};

export type DeviceFinder = typeof defaultDeviceFinder;

export const defaultJsonLoader = (name: string): RawItems | DeviceSpec =>
    JSON.parse(Deno.readTextFileSync(name));

export type JsonLoader = typeof defaultJsonLoader;

export type DeviceFileOperations = [DeviceFinder, JsonLoader];
