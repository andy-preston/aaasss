import { existsSync } from "fs/exists";
import type { Context } from "../context/context.ts";
import type { Box, Failure } from "../value-or-failure.ts";
import { box } from "../value-or-failure.ts";
import { failure } from "../value-or-failure.ts";
import type { DeviceProperties } from "./properties.ts";

type FullSpec = Record<string, number | boolean | Array<string>>;
type RawProperty = string | boolean | Array<string>;
type RawItem = { "description"?: string; "value": RawProperty };
type RawItems = Record<string, RawItem>;
type DeviceSpec = { "family"?: string; "spec": RawItems };

const deviceFileName = (deviceName: string) =>
    deviceName.replace(/[^\w\']|_/g, "").toLowerCase();

export const deviceChooser = (
    properties: DeviceProperties,
    context: Context
) => {
    const loadJsonFile = (name: string) => {
        const json = Deno.readTextFileSync(name);
        return JSON.parse(json);
    };

    const hexNumber = (value: string): number => {
        const asNumber = parseInt(value, 16);
        const asHex = asNumber.toString(16).padStart(value.length, "0");
        if (asHex != value.toLowerCase()) {
            throw new Error(`expected ${value} to be a hex number`);
        }
        return asNumber;
    };

    const choose = (
        deviceName: string,
        fullSpec: FullSpec
    ): Box<string> | Failure => {
        const previousName = properties.name();
        if (previousName == deviceName) {
            return box("");
        }
        if (previousName != "") {
            return failure(undefined, "device.multiple", undefined);
        }
        properties.setName(deviceName);
        for (const [key, value] of Object.entries(fullSpec)) {
            switch (key) {
                case "unsupportedInstructions":
                    properties.unsupportedInstructions(
                        value as Array<string>
                    );
                    break;
                case "reducedCore":
                    properties.reducedCore(value as boolean);
                    properties.registers(value as boolean);
                    break;
                case "programEnd":
                    properties.programMemoryBytes(value as number);
                    break;
                default:
                    context.property(key, value as number);
                    break;
            }
        }
        return box("");
    };

    const directive = (name: string): Box<string> | Failure => {
        const fullSpec: FullSpec = {};

        const loadSpec = (spec: RawItems) => {
            for (const [key, item] of Object.entries(spec)) {
                if (Object.hasOwn(fullSpec, key)) {
                    throw new Error(
                        `${key} declared multiple times in ${name} spec`
                    );
                }
                fullSpec[key] = typeof item.value == "string"
                    ? hexNumber(item.value)
                    : item.value;
            }
        };

        const baseName = `./devices/${deviceFileName(name)}.json`;
        if (!existsSync(baseName)) {
            return failure(undefined, "device.notFound", undefined);
        }
        const baseSpec: DeviceSpec = loadJsonFile(baseName);
        const familySpec: RawItems = "family" in baseSpec
            ? loadJsonFile(`./devices/families/${baseSpec.family}.json`)
            : {};
        loadSpec(baseSpec.spec);
        loadSpec(familySpec);
        return choose(name, fullSpec);
    };

    return {
        "choose": choose,
        "directive": directive,
    };
};
