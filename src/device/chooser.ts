import type { DirectiveResult } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { DeviceSpec, SpecItems } from "./data-types.ts";
import type { DeviceFileOperations } from "./file.ts";
import type { DeviceSettings } from "./settings.ts";

import { addFailure } from "../failure/add-failure.ts";

export const deviceChooser = (
    currentLine: CurrentLine,
    deviceSettings: DeviceSettings, fileOperations: DeviceFileOperations
) => {
    const [deviceFinder, loadTomlFile] = fileOperations;

    return (name: string): DirectiveResult => {
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
        if (typeof baseName != "string") {
            addFailure(currentLine().failures, baseName);
            return undefined;
        }

        const baseSpec = loadTomlFile(baseName) as DeviceSpec;
        loadSpec(baseSpec.spec);

        if ("family" in baseSpec) {
            loadSpec(loadTomlFile(
                `./devices/families/${baseSpec.family}.toml`
            ) as SpecItems);
        }
        deviceSettings(name, fullSpec);
        return undefined;
    };
};

export type DeviceChooser = ReturnType<typeof deviceChooser>;
