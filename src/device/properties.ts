import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { Mnemonic } from "../tokens/data-types.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const deviceProperties = () => {
    let reducedCore = false;

    const unsupported = unsupportedInstructions();

    const symbols: Map<string, string> = new Map([]);

    const property = (symbolName: string, value: string) => {
        symbols.set(symbolName, value);
    };

    const has = (symbolName: string) => symbols.has(symbolName);

    const deviceName = () => symbols.get("deviceName");

    const value = (symbolName: string) => {
        if (!symbols.has("deviceName")) {
            return failure(undefined, "device_notSelected", [symbolName]);
        }
        if (!symbols.has(symbolName)) {
            return failure(undefined, "symbol_notFound", [
                symbols.get("deviceName") as string,
                symbolName
            ]);
        }
        return box(symbols.get(symbolName)!);
    };

    const numericValue = (symbolName: string) => {
        const theValue = value(symbolName);
        if (theValue.which == "failure") {
            return theValue;
        }
        if (!theValue.value.match(/^[0-9A-F]*$/)) {
            return failure(undefined, "device_internalFormat", [
                symbols.get("deviceName")!,
                symbolName,
                theValue.value
            ]);
        }
        return box(parseInt(theValue.value, 16));
    };

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
        "deviceName": deviceName,
        "public": {
            "has": has,
            "value": value,
            "numericValue": numericValue,
            "hasReducedCore": hasReducedCore,
            "isUnsupported": isUnsupported,
        },
    };
};

export type DeviceProperties = ReturnType<typeof deviceProperties>;
export type DevicePropertiesInterface = DeviceProperties["public"];
