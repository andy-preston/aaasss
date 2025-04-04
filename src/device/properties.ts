import { booleanBag } from "../assembler/bags.ts";
import { bagOfFailures, boringFailure, clueFailure, type BooleanOrFailures } from "../failure/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Mnemonic } from "../tokens/data-types.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const deviceProperties = (symbolTable: SymbolTable) => {
    let reducedCore = false;

    const unsupported = unsupportedInstructions();

    const deviceIsDefined = () => {
        const deviceName = symbolTable.symbolValue("deviceName");
        return deviceName.type == "string" && deviceName.it != "";
    }

    const hasReducedCore = (): BooleanOrFailures =>
        deviceIsDefined()
            ? booleanBag(reducedCore)
            : bagOfFailures([boringFailure("device_notSelected")]);

    const isUnsupported = (mnemonic: Mnemonic): BooleanOrFailures =>
        !deviceIsDefined()
            ? bagOfFailures([
                boringFailure("device_notSelected"),
                clueFailure("mnemonic_supportedUnknown", mnemonic)
            ])
            : unsupported.isUnsupported(mnemonic)
            ? bagOfFailures([clueFailure("mnemonic_notSupported", mnemonic)])
            : booleanBag(false);

    const setReducedCore = (value: boolean) => {
        reducedCore = value;
    };

    return {
        "reducedCore": setReducedCore,
        "unsupportedInstructions": unsupported.choose,
        "public": {
            "hasReducedCore": hasReducedCore,
            "isUnsupported": isUnsupported,
        },
    };
};

export type DeviceProperties = ReturnType<typeof deviceProperties>;
export type DevicePropertiesInterface = DeviceProperties["public"];
