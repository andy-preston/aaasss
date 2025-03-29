import { booleanBag, numberBag, stringBag } from "../assembler/bags.ts";
import { bagOfFailures, type StringOrFailures, type NumberOrFailures, type BooleanOrFailures, clueFailure, boringFailure, Failure, deviceFailure } from "../failure/bags.ts";
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

    const value = (symbolName: string): StringOrFailures => {
        const failures: Array<Failure> = [];
        if (!symbols.has("deviceName")) {
            failures.push(boringFailure("device_notSelected"));
        }
        if (!symbols.has(symbolName)) {
            failures.push(deviceFailure(
                "symbol_notFound",
                symbols.get("deviceName") as string, symbolName
            ));
        }
        return failures.length > 0
            ? bagOfFailures(failures)
            : stringBag(symbols.get(symbolName)!);
    };

    const numericValue = (symbolName: string): NumberOrFailures => {
        const theValue = value(symbolName);
        if (theValue.type == "failures") {
            return theValue;
        }
        if (!theValue.it.match(/^[0-9A-F]*$/)) {
            return bagOfFailures([deviceFailure(
                "device_internalFormat",
                symbols.get("deviceName")!, `${symbolName}: ${theValue.it}`
            )]);
        }
        return numberBag(parseInt(theValue.it, 16));
    };

    const hasReducedCore = (): BooleanOrFailures =>
        symbols.has("deviceName")
            ? booleanBag(reducedCore)
            : bagOfFailures([boringFailure("device_notSelected")]);

    const isUnsupported = (mnemonic: Mnemonic): BooleanOrFailures =>
        !symbols.has("deviceName")
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
