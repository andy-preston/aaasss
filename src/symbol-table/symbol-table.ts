import { emptyBag, numberBag } from "../assembler/bags.ts";
import type { ValueDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { bagOfFailures, boringFailure, definitionFailure } from "../failure/bags.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolBag } from "./bags.ts";
import { counting } from "./counting.ts";

type SymbolList = Map<string, SymbolBag>;
type DefinitionList = Map<string, string>;

////////////////////////////////////////////////////////////////////////////////
//
// If we're going to have filename and line number in the symbol table it would
// be nice to auto-format it into a nicely spaced out table too!
//
////////////////////////////////////////////////////////////////////////////////

export const symbolTable = (cpuRegisters: CpuRegisters) => {
    const varSymbols:   SymbolList     = new Map();
    const constSymbols: SymbolList     = new Map();
    const definitions:  DefinitionList = new Map();

    const counts = counting();

    const resetState = () => {
        counts.reset();
        definitions.clear();
        varSymbols.clear();
    };

    const isDefinedSymbol = (symbolName: string) =>
        constSymbols.has(symbolName) || varSymbols.has(symbolName);

    const alreadyInUse = (symbolName: string) =>
        cpuRegisters.has(symbolName) || isDefinedSymbol(symbolName) ?
            bagOfFailures([definitionFailure(
                "symbol_alreadyExists", symbolName, definition(symbolName)
            )]) : emptyBag();

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
                    ? undefined : device.it,
                symbolName, expectedType, value.type
            ].join(" - ");
            throw new Error(`Device configuration error ${suffix}`);
        }
        return value;
    };

    const existingValueIs = (symbolName: string, value: SymbolBag) => {
        const existing = symbolValue(symbolName);
        return existing.type == value.type && existing.it == value.it;
    };

    const newDefinition = (symbolName: string) => {
        const fileName = currentFileName();
        if (fileName) {
            definitions.set(symbolName, `${fileName}:${currentLineNumber()}`);
        }
    };

    const definition = (symbolName: string) => {
        const definition = definitions.get(symbolName);
        return definition != undefined ? definition
            : cpuRegisters.has(symbolName) ? "REGISTER"
            : "BUILT_IN";
    };

    const userSymbol = (
        symbolName: string, value: SymbolBag
    ): DirectiveResult => {
        const inUse = alreadyInUse(symbolName);
        if (inUse.type == "failures") {
            return inUse;
        }
        varSymbols.set(symbolName, value);
        counts.set(symbolName);
        newDefinition(symbolName);
        return emptyBag();
    };

    const deviceSymbol = (
        symbolName: string, value: SymbolBag
    ): DirectiveResult => {
        const inUse = alreadyInUse(symbolName);
        if (inUse.type == "failures") {
            return inUse;
        }
        varSymbols.set(symbolName, value);
        newDefinition(symbolName);
        return emptyBag();
    };

    const persistentSymbol = (
        symbolName: string, value: SymbolBag
    ) => {
        const inUse = alreadyInUse(symbolName);
        if (inUse.type == "failures" && !existingValueIs(symbolName, value)) {
            return inUse;
        }
        constSymbols.set(symbolName, value);
        counts.set(symbolName);
        newDefinition(symbolName);
        return emptyBag();
    };

    const builtInSymbol = (
        symbolName: string, value: SymbolBag
    ) => {
        if (constSymbols.has(symbolName) || varSymbols.has(symbolName)) {
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
        "it": (symbolName: string, value: number) =>
            persistentSymbol(symbolName, numberBag(value))
    };

    const use = (symbolName: string): SymbolBag => {
        if (cpuRegisters.has(symbolName)) {
            counts.increment(symbolName, "revealIfHidden");
            return numberBag(cpuRegisters.value(symbolName)!);
        }
        if (constSymbols.has(symbolName)) {
            counts.increment(symbolName, "keepHidden");
            return constSymbols.get(symbolName)!;
        }
        if (varSymbols.has(symbolName)) {
            counts.increment(symbolName, "revealIfHidden");
            return varSymbols.get(symbolName)!;
        }
        return emptyBag();
    };

    const listValue = (symbolName: string) => {
        const value = symbolValue(symbolName);
        return ["number", "string"].includes(value.type) ? `${value.it}` : "";
    };

    const list = () => counts.list().map(
        ([symbolName, count]) => [
            symbolName, count, listValue(symbolName), definition(symbolName)
        ] as [string, number, string, string]
    );

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
        "count": counts.count,
        "list": list,
        "resetState": resetState,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
