import type { DiscreteType, Pass, PipelineReset } from "../assembler/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolValue } from "./data-types.ts";

import { isDiscrete } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { boringFailure, definitionFailure } from "../failure/bags.ts";
import { counting } from "./counting.ts";
import { definitionList } from "./definition-list.ts";

export const symbolTable = (
    currentLine: CurrentLine, cpuRegisters: CpuRegisters
) => {
    const varSymbols:   Map<string, SymbolValue> = new Map();
    const constSymbols: Map<string, SymbolValue> = new Map();

    const counts = counting();
    const definitions = definitionList(currentLine);

    const reset: PipelineReset = (pass: Pass) => {
        if (pass == 1) {
            counts.reset();
            definitions.reset();
            varSymbols.clear();
        }
    };

    const isDefinedSymbol = (symbolName: string) =>
        constSymbols.has(symbolName) || varSymbols.has(symbolName);

    const alreadyInUse = (
        symbolName: string, checkExistingValue?: SymbolValue
    ): boolean => {
        if (cpuRegisters.has(symbolName)) {
            addFailure(currentLine().failures, definitionFailure(
                "symbol_alreadyExists", symbolName, "REGISTER"
            ));
            return true;
        }
        if (!isDefinedSymbol(symbolName)) {
            return false;
        }
        const withDifferentValue = checkExistingValue == undefined
            || symbolValue(symbolName) !== checkExistingValue
        if (withDifferentValue) {
            addFailure(currentLine().failures, definitionFailure(
                "symbol_alreadyExists", symbolName,
                definitions.text(symbolName, 'BUILT_IN')
            ));
            return true;
        }
        return false;
    };

    const symbolValue = (symbolName: string): SymbolValue =>
        constSymbols.has(symbolName) ? constSymbols.get(symbolName)!
        : varSymbols.has(symbolName) ? varSymbols.get(symbolName)!
        : ("" as SymbolValue);

    const deviceNameForError = () => {
        const device = varSymbols.get("deviceName");
        return typeof device != "string" ? "" : (device as string);
    };

    const deviceSymbolValue = (
        symbolName: string, expectedType: DiscreteType
    ): SymbolValue | undefined => {
        if (!varSymbols.has("deviceName")) {
            addFailure(currentLine().failures, boringFailure(
                "device_notSelected"
            ));
            return undefined;
        }
        const value = symbolValue(symbolName);
        if ((typeof value) != expectedType) {
            throw new Error([
                "Device configuration error",
                deviceNameForError(), symbolName, expectedType, `${value}`
            ].join(" - "));
        }
        return value;
    };

    const userSymbol = (symbolName: string, value: SymbolValue): void => {
        if (!alreadyInUse(symbolName)) {
            varSymbols.set(symbolName, value);
            counts.set(symbolName);
            definitions.set(symbolName);
        }
    };

    const deviceSymbol = (symbolName: string, value: SymbolValue): boolean => {
        const result = !alreadyInUse(symbolName);
        if (result) {
            varSymbols.set(symbolName, value);
            definitions.set(symbolName);
        }
        return result;
    };

    const persistentSymbol = (symbolName: string, value: SymbolValue): void => {
        if (!alreadyInUse(symbolName, value)) {
            constSymbols.set(symbolName, value);
            counts.set(symbolName);
            definitions.set(symbolName);
        }
    };

    const builtInSymbol = (symbolName: string, value: SymbolValue): void => {
        if (isDefinedSymbol(symbolName)) {
            throw new Error(`Redefined built in symbol: ${symbolName}`);
        }
        constSymbols.set(symbolName, value);
    };

    const use = (symbolName: string): SymbolValue => {
        if (cpuRegisters.has(symbolName)) {
            counts.increment(symbolName, "revealIfHidden");
            return cpuRegisters.value(symbolName);
        }
        if (varSymbols.has(symbolName)) {
            counts.increment(symbolName, "revealIfHidden");
            return varSymbols.get(symbolName)!;
        }
        if (constSymbols.has(symbolName)) {
            counts.increment(symbolName, "keepHidden");
            return constSymbols.get(symbolName)!;
        }
        return "";
    };

    const listValue = (symbolName: string): DiscreteType => {
        const value = symbolValue(symbolName);
        return isDiscrete(value) ? value : "";
    };

    const list = () => counts.list().map(
        ([symbolName, count]) => [
            symbolName,
            listValue(symbolName),
            definitions.text(
                symbolName,
                cpuRegisters.has(symbolName) ? "REGISTER" : "BUILT_IN"
            ),
            count
        ] as [string, DiscreteType, string, number]
    );

    return {
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
        "reset": reset
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
