import { emptyBag, numberBag } from "../assembler/bags.ts";
import type { Pass } from "../assembler/pass.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { ValueDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { bagOfFailures, clueFailure } from "../failure/bags.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { FileName, LineNumber } from "../source-code/data-types.ts";
import type { SymbolBag } from "./bags.ts";

type SymbolList = Map<string, SymbolBag>;
type CountList = Map<string, number>;
type DefinitionList = Map<string, string>;

export const symbolTable = (
    deviceProperties: DevicePropertiesInterface,
    cpuRegisters: CpuRegisters,
    _pass: Pass
) => {
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
        constSymbols.has(symbolName) || varSymbols.has(symbolName)
        || deviceProperties.has(symbolName);

    const alreadyInUse = (symbolName: string) =>
        cpuRegisters.has(symbolName) || isDefinedSymbol(symbolName);

    const existingValue = (
        symbolName: string
    ) => constSymbols.has(symbolName)
        ? constSymbols.get(symbolName)!
        : varSymbols.get(symbolName)!;

    const existingValueIs = (
        symbolName: string, value: SymbolBag
    ) => {
        const existing = existingValue(symbolName);
        return existing != undefined
            && existing.type == value.type && existing.it == value.it;
    }

    const variableSymbol = (
        symbolName: string, value: SymbolBag,
        fileName: FileName, lineNumber: LineNumber
    ): DirectiveResult => {
        if (alreadyInUse(symbolName)) {
            return bagOfFailures([
                clueFailure("symbol_alreadyExists", symbolName)
            ]);
        }
        varSymbols.set(symbolName, value);
        counts.set(symbolName, 0);
        definitions.set(
            symbolName, fileName ? `${fileName}:${lineNumber}` : ""
        );
        return emptyBag();
    };

    const constantSymbol = (
        symbolName: string, value: SymbolBag,
        fileName: FileName, lineNumber: LineNumber
    ) => {
        if (alreadyInUse(symbolName) && !existingValueIs(symbolName, value)) {
            return bagOfFailures([
                clueFailure("symbol_alreadyExists", symbolName)
            ]);
        }
        constSymbols.set(symbolName, value);
        counts.set(symbolName, 0);
        definitions.set(
            symbolName, fileName ? `${fileName}:${lineNumber}` : ""
        );
        return emptyBag();
    };

    const builtInSymbol = (
        symbolName: string, value: SymbolBag
    ) => {
        if (alreadyInUse(symbolName)) {
            throw new Error(`Redefined built in symbol: ${symbolName}`);
        }
        constSymbols.set(symbolName, value);
        definitions.set(symbolName, "BUILT_IN");
        return emptyBag();
    };

    const defineDirective: ValueDirective = {
        // This is the directive for doing a "define" operation
        // not a function for defining directives.
        // The number of times I've assumed the wrong thing is ridiculous!
        "type": "valueDirective",
        "it": (symbolName: string, value: number) => constantSymbol(
            symbolName, numberBag(value),
            currentFileName(), currentLineNumber()
        )
    };

    const count = (symbolName: string) => {
        const result = counts.get(symbolName);
        return result == undefined ? 0 : result;
    };

    const increment = (symbolName: string) => {
        const counted = counts.get(symbolName);
        if (counted != undefined) {
            counts.set(symbolName, counted + 1);
        }
    }

    const use = (symbolName: string): SymbolBag => {
        if (constSymbols.has(symbolName)) {
            increment(symbolName);
            return constSymbols.get(symbolName)!;
        }

        if (varSymbols.has(symbolName)) {
            increment(symbolName);
            return varSymbols.get(symbolName)!;
        }

        const property = deviceProperties.value(symbolName);
        if (property.type == "string") {
            increment(symbolName);
            return property;
        }

        increment(symbolName);
        return numberBag(cpuRegisters.value(symbolName));
    };

    const notCounted = (symbolName: string) => constSymbols.get(symbolName)!;

    const listValue = (symbolName: string) => {
        const property = deviceProperties.value(symbolName);
        if (property.type == "string") {
            return property.it;
        }
        const fromList = notCounted(symbolName);
        return fromList != undefined
            && (fromList.type == "string" || fromList.type == "number")
            ? fromList.it
            : undefined;
    };

    const listDefinition = (symbolName: string) => {
        const fromList = definitions.get(symbolName);
        return fromList == undefined ? "" : fromList;
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
    }

    return {
        "defineDirective": defineDirective,
        "isDefinedSymbol": isDefinedSymbol,
        "alreadyInUse": alreadyInUse,
        "variableSymbol": variableSymbol,
        "constantSymbol": constantSymbol,
        "builtInSymbol": builtInSymbol,
        "use": use,
        "notCounted": notCounted,
        "count": count,
        "list": list,
        "resetState": resetState,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
