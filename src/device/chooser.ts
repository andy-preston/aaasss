import { emptyBag } from "../assembler/bags.ts";
import type { StringDirective } from "../directives/bags.ts";
import { bagOfFailures, comparisonFailure, type StringOrFailures } from "../failure/bags.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { DeviceSpec, FullSpec, RawItems } from "./data-types.ts";
import type { DeviceFileOperations } from "./device-file.ts";
import type { DeviceProperties } from "./properties.ts";

export const deviceChooser = (
    deviceProperties: DeviceProperties,
    cpuRegisters: CpuRegisters,
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
        deviceName: string, fullSpec: FullSpec
    ): StringOrFailures => {
        const previousName = deviceProperties.deviceName();
        if (previousName == deviceName) {
            return emptyBag()
        }
        if (previousName != undefined) {
            return bagOfFailures([
                comparisonFailure("device_multiple", previousName, deviceName)
            ]);
        }
        deviceProperties.property("deviceName", deviceName);
        for (const [key, value] of Object.entries(fullSpec)) {
            switch (key) {
                case "unsupportedInstructions":
                    deviceProperties.unsupportedInstructions(
                        value as Array<string>
                    );
                    break;
                case "reducedCore":
                    deviceProperties.reducedCore(value as boolean);
                    cpuRegisters.initialise(value as boolean);
                    break;
                default:
                    deviceProperties.property(key, `${value}`);
                    break;
            }
        }
        return emptyBag();
    };

    const device = (name: string): StringOrFailures => {
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

        const baseName = deviceFinder(name);
        if (baseName.type == "failures") {
            return baseName;
        }

        const baseSpec = loadJsonFile(baseName.it) as DeviceSpec;
        const familySpec = (
            "family" in baseSpec
                ? loadJsonFile(`./devices/families/${baseSpec.family}.json`)
                : {}
        ) as RawItems;
        loadSpec(baseSpec.spec);
        loadSpec(familySpec);
        return choose(name, fullSpec);
    };

    const deviceDirective: StringDirective = {
        "type": "stringDirective", "it": device
    };

    return {
        "choose": choose,
        "deviceDirective": deviceDirective
    };
};
