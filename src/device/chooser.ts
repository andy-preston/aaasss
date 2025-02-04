import type { Directive } from "../directives/directive.ts";
import { stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { DeviceSpec, FullSpec, RawItems } from "./data-types.ts";
import type { DeviceFileOperations } from "./device-file.ts";
import type { DeviceProperties } from "./properties.ts";

export const deviceChooser = (
    properties: DeviceProperties,
    symbolTable: SymbolTable,
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
    ): Box<undefined> | Failure => {
        const previousName = properties.name();
        if (previousName == deviceName) {
            return emptyBox();
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
                    symbolTable.internalSymbol(key, value as number);
                    break;
            }
        }
        return emptyBox();
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
        const baseSpec = loadJsonFile(baseName.value) as DeviceSpec;
        const familySpec = (
            "family" in baseSpec
                ? loadJsonFile(`./devices/families/${baseSpec.family}.json`)
                : {}
        ) as RawItems;
        loadSpec(baseSpec.spec);
        loadSpec(familySpec);
        return choose(name, fullSpec);
    };

    return {
        "choose": choose,
        "device": device
    };
};
