import type { Directive } from "../directives/data-types.ts";
import { stringParameter } from "../directives/type-checking.ts";
import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { Context } from "../javascript/context.ts";
import type { DeviceFileOperations } from "./device-file.ts";
import type { DeviceProperties } from "./properties.ts";

type FullSpec = Record<string, number | boolean | Array<string>>;
type RawProperty = string | boolean | Array<string>;
type RawItem = { "description"?: string; "value": RawProperty };
type RawItems = Record<string, RawItem>;
type DeviceSpec = { "family"?: string; "spec": RawItems };

export const deviceChooser = (
    properties: DeviceProperties,
    context: Context,
    fileOperations: DeviceFileOperations
) => {
    const [deviceFinder, loadJsonFile] = fileOperations;

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
            return failure(undefined, "device_multiple", undefined);
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
                case "ramStart":
                    properties.ramStart(value as number);
                    break;
                case "ramEnd":
                    properties.ramEnd(value as number);
                    break;
                default:
                    context.property(key, value as number);
                    break;
            }
        }
        return box("");
    };

    const device: Directive = (name: string) => {
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

        const check = stringParameter(name);
        if (check.which == "failure") {
            return check;
        }
        const baseName = deviceFinder(name);
        if (baseName.which == "failure") {
            return baseName;
        }
        const baseSpec: DeviceSpec = loadJsonFile(baseName.value);
        const familySpec: RawItems = "family" in baseSpec
            ? loadJsonFile(`./devices/families/${baseSpec.family}.json`)
            : {};
        loadSpec(baseSpec.spec);
        loadSpec(familySpec);
        return choose(name, fullSpec);
    };

    return {
        "choose": choose,
        "device": device
    };
};
