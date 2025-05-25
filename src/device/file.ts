import type { StringOrFailures } from "../failure/bags.ts";
import type { DeviceSpec, SpecItems } from "./data-types.ts";

import { existsSync } from "jsr:@std/fs/exists";
import { parse } from "jsr:@std/toml";
import { stringBag } from "../assembler/bags.ts";
import { bagOfFailures, clueFailure } from "../failure/bags.ts";

export const defaultDeviceFinder = (deviceName: string): StringOrFailures => {
    const fileName = deviceName.replace(/[^\w]|_/g, "").toLowerCase();
    const baseName = `./devices/${fileName}.toml`;
    return existsSync(baseName)
        ? stringBag(baseName)
        : bagOfFailures([clueFailure("device_notFound", baseName)]);
};

export type DeviceFinder = typeof defaultDeviceFinder;

export const defaultTomlLoader = (name: string): SpecItems | DeviceSpec => {
    const result = parse(Deno.readTextFileSync(name));
    return Object.hasOwn(result, "family")
        ? result as DeviceSpec
        : result as SpecItems
}

export type TomlLoader = typeof defaultTomlLoader;

export type DeviceFileOperations = [DeviceFinder, TomlLoader];
