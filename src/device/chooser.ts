import type { StringOrFailures } from "../failure/bags.ts";
import type { DeviceSpec, SpecItems } from "./data-types.ts";
import type { DeviceFileOperations } from "./file.ts";
import type { DeviceSettings } from "./settings.ts";

export const deviceChooser = (
    deviceSettings: DeviceSettings, fileOperations: DeviceFileOperations
) => {
    const [deviceFinder, loadTomlFile] = fileOperations;

    return (name: string): StringOrFailures => {
        const fullSpec: SpecItems = {};

        const loadSpec = (spec: SpecItems) => {
            for (const [key, item] of Object.entries(spec)) {
                if (Object.hasOwn(fullSpec, key)) {
                    throw new Error(`multiple ${key} in ${name} device spec`);
                }
                fullSpec[key] = item;
            }
        };

        const baseName = deviceFinder(name);
        if (baseName.type == "failures") {
            return baseName;
        }

        const baseSpec = loadTomlFile(baseName.it) as DeviceSpec;
        loadSpec(baseSpec.spec);

        if ("family" in baseSpec) {
            loadSpec(loadTomlFile(
                `./devices/families/${baseSpec.family}.toml`
            ) as SpecItems);
        }
        return deviceSettings(name, fullSpec);
    };
};

export type DeviceChooser = ReturnType<typeof deviceChooser>;
