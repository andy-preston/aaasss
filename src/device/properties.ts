import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { Mnemonic } from "../tokens/data-types.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const deviceProperties = () => {
    let reducedCore = false;

    const unsupported = unsupportedInstructions();

    const symbols: Map<string, number | string> = new Map([]);

    const property = (symbolName: string, value: number | string) => {
        symbols.set(symbolName, value);
    };

    const has = (symbolName: string) => symbols.has(symbolName);

    const rawValue = (symbolName: string) => symbols.get(symbolName);

    const value = (symbolName: string) => !symbols.has("deviceName")
        ? failure(undefined, "device_notSelected", undefined)
        : symbols.has(symbolName)
        ? box(symbols.get(symbolName))
        : failure(undefined, "symbol_notFound", symbolName)

    const numeric = (symbolName: string) => {
        const result = value(symbolName);
        return result.which == "failure"
            ? result
            : typeof result.value == "number"
            ? result as Box<number>
            : failure(undefined, "type_number", symbolName);
    }

    const hasReducedCore = (): Box<boolean> | Failure =>
        symbols.has("deviceName")
            ? box(reducedCore)
            : failure(undefined, "device_notSelected", undefined);

    const isUnsupported = (mnemonic: Mnemonic): Box<boolean> | Failure =>
        !symbols.has("deviceName")
            ? failure(undefined, "mnemonic_supportedUnknown", undefined)
            : unsupported.isUnsupported(mnemonic)
            ? failure(undefined, "mnemonic_notSupported", undefined)
            : box(false);

    const setReducedCore = (value: boolean) => {
        reducedCore = value;
    };

    return {
        "property": property,
        "reducedCore": setReducedCore,
        "unsupportedInstructions": unsupported.choose,
        "public": {
            "has": has,
            "value": value,
            "numeric": numeric,
            "rawValue": rawValue,
            "hasReducedCore": hasReducedCore,
            "isUnsupported": isUnsupported,
        },
    };
};

export type DeviceProperties = ReturnType<typeof deviceProperties>;
export type DevicePropertiesInterface = DeviceProperties["public"];
