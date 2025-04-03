import { emptyBag, numberBag } from "../assembler/bags.ts";
import type { ValueDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { bagOfFailures, boringFailure, clueFailure } from "../failure/bags.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolBag } from "./bags.ts";

type SymbolList = Map<string, SymbolBag>;
type CountList = Map<string, number>;
type DefinitionList = Map<string, string>;

export const symbolTable = (cpuRegisters: CpuRegisters) => {
    const varSymbols:   SymbolList     = new Map();
    const constSymbols: SymbolList     = new Map();
    const counts:       CountList      = new Map();
    const definitions:  DefinitionList = new Map();

    const resetState = () => {
        counts.clear();
        definitions.clear();
        varSymbols.clear();
    };

    const isDefinedSymbol = (symbolName: string) =>
        constSymbols.has(symbolName) || varSymbols.has(symbolName);

    const alreadyInUse = (symbolName: string) =>
        cpuRegisters.has(symbolName) || isDefinedSymbol(symbolName);

    const symbolValue = (symbolName: string) =>
        constSymbols.has(symbolName) ? constSymbols.get(symbolName)!
        : varSymbols.has(symbolName) ? varSymbols.get(symbolName)!
        : emptyBag();

    const deviceSymbolValue = (
        symbolName: string, expectedType: "string" | "number"
    ) => {
        if (!varSymbols.has("deviceName")) {
            return bagOfFailures([boringFailure("device_notSelected")]);
        }
        const value = symbolValue(symbolName);
        if (value.type != expectedType) {
            const device = varSymbols.get("deviceName");
            const suffix = [
                device == undefined || device.type != "string"
                    ? undefined :  device.it,
                symbolName, expectedType, value.type
            ].join(" - ");
            throw new Error(`Device configuration error ${suffix}`);
        }
        return value;
    };

    const existingValueIs = (symbolName: string, value: SymbolBag) => {
        const existing = symbolValue(symbolName);
        return existing != undefined
            && existing.type == value.type && existing.it == value.it;
    };

    const increment = (
        symbolName: string, exposure: "revealIfHidden" | "keepHidden"
    ) => {
        const count = counts.get(symbolName);
        if (count != undefined) {
            counts.set(symbolName, count + 1);
            return;
        }
        if (exposure == "revealIfHidden") {
            counts.set(symbolName, 1);
        }
    };

    const count = (symbolName: string) => {
        const result = counts.get(symbolName);
        return result == undefined ? 0 : result;
    };

    const definition = (symbolName: string) => {
        const fileName = currentFileName();
        if (fileName) {
            definitions.set(symbolName, `${fileName}:${currentLineNumber()}`);
        }
    };

    const userSymbol = (
        symbolName: string, value: SymbolBag
    ): DirectiveResult => {
        if (alreadyInUse(symbolName)) {
            return bagOfFailures([
                clueFailure("symbol_alreadyExists", symbolName)
            ]);
        }
        varSymbols.set(symbolName, value);
        counts.set(symbolName, 0);
        definition(symbolName);
        return emptyBag();
    };

    const deviceSymbol = (
        symbolName: string, value: SymbolBag
    ): DirectiveResult => {
        if (alreadyInUse(symbolName)) {
            return bagOfFailures([
                clueFailure("symbol_alreadyExists", symbolName)
            ]);
        }
        varSymbols.set(symbolName, value);
        definition(symbolName);
        return emptyBag();
    };

    const persistentSymbol = (
        symbolName: string, value: SymbolBag
    ) => {
        if (alreadyInUse(symbolName) && !existingValueIs(symbolName, value)) {
            return bagOfFailures([
                clueFailure("symbol_alreadyExists", symbolName)
            ]);
        }
        constSymbols.set(symbolName, value);
        counts.set(symbolName, 0);
        definition(symbolName);
        return emptyBag();
    };

    const builtInSymbol = (
        symbolName: string, value: SymbolBag
    ) => {
        if (alreadyInUse(symbolName)) {
            throw new Error(`Redefined built in symbol: ${symbolName}`);
        }
        constSymbols.set(symbolName, value);
        return emptyBag();
    };

    const defineDirective: ValueDirective = {
        // This is the directive for doing a "define" operation
        // not a function for defining directives.
        // The number of times I've assumed the wrong thing is ridiculous!
        "type": "valueDirective",
        "it": (symbolName: string, value: number) => persistentSymbol(
            symbolName, numberBag(value)
        )
    };

    const use = (symbolName: string): SymbolBag => {
        if (cpuRegisters.has(symbolName)) {
            increment(symbolName, "revealIfHidden");
            return numberBag(cpuRegisters.value(symbolName)!);
        }

        if (constSymbols.has(symbolName)) {
            increment(symbolName, "keepHidden");
            return constSymbols.get(symbolName)!;
        }

        if (varSymbols.has(symbolName)) {
            increment(symbolName, "revealIfHidden");
            return varSymbols.get(symbolName)!;
        }

        return emptyBag();
    };

    const listDefinition = (symbolName: string) => {
        const definition = definitions.get(symbolName);
        return definition == undefined ? "" : definition;
    };

    const listValue = (symbolName: string) => {
        const value = symbolValue(symbolName);
        return ["number", "string"].includes(value.type) ? `${value.it}` : "";
    };

    const list = () => {
        const asArray: Array<[
            string,
            number,
            string | number | undefined,
            string
        ]> = [];
        counts.forEach((count: number, symbolName: string) => {
            asArray.push([
                symbolName, count,
                listValue(symbolName), listDefinition(symbolName)
            ]);
        });
        return asArray;
    };

    return {
        "defineDirective": defineDirective,
        "isDefinedSymbol": isDefinedSymbol,
        "alreadyInUse": alreadyInUse,
        "userSymbol": userSymbol,
        "persistentSymbol": persistentSymbol,
        "builtInSymbol": builtInSymbol,
        "deviceSymbol": deviceSymbol,
        "symbolValue": symbolValue,
        "deviceSymbolValue": deviceSymbolValue,
        "use": use,
        "count": count,
        "list": list,
        "resetState": resetState,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
