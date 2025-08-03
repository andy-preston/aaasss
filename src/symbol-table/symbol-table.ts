import type { Pass, PipelineReset } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { DiscreteType, SymbolValue } from "./data-types.ts";

import { boringFailure, definitionFailure } from "../failure/bags.ts";
import { counting } from "./counting.ts";
import { isDiscrete } from "./data-types.ts";
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

    const isInLists = (symbolName: string) =>
        constSymbols.has(symbolName) || varSymbols.has(symbolName);

    const has = (symbolName: string) =>
        isInLists(symbolName)
        || isInLists(`${symbolName}${currentLine().symbolSuffix}`);

    const failIfInUse = (
        symbolName: string, checkExistingValue?: SymbolValue
    ): boolean => {
        if (cpuRegisters.has(symbolName)) {
            currentLine().failures(definitionFailure(
                "symbol_alreadyExists", symbolName, "REGISTER"
            ));
            return true;
        }
        if (!isInLists(symbolName)) {
            return false;
        }
        const failed = checkExistingValue == undefined
            || internalValue(symbolName) !== checkExistingValue
        if (failed) {
            currentLine().failures(definitionFailure(
                "symbol_alreadyExists", symbolName,
                definitions.text(symbolName, 'BUILT_IN')
            ));
            return true;
        }
        return false;
    };

    const internalValue = (symbolName: string): SymbolValue =>
        constSymbols.has(symbolName) ? constSymbols.get(symbolName)!
        : varSymbols.has(symbolName) ? varSymbols.get(symbolName)!
        : ("" as SymbolValue);

    const deviceSymbolValue = (
        symbolName: string, expectedType: DiscreteType
    ): SymbolValue | undefined => {
        if (!varSymbols.has("deviceName")) {
            currentLine().failures(boringFailure(
                "device_notSelected"
            ));
            return undefined;
        }
        const value = internalValue(symbolName);
        if ((typeof value) != expectedType) {
            throw new Error([
                "Device configuration error",
                varSymbols.get("deviceName") as string,
                symbolName, expectedType, `${value}`
            ].join(" - "));
        }
        return value;
    };

    const userSymbol = (symbolName: string, value: SymbolValue): void => {
        if (!failIfInUse(symbolName)) {
            varSymbols.set(symbolName, value);
            counts.set(symbolName);
            definitions.set(symbolName);
        }
    };

    const deviceSymbol = (symbolName: string, value: SymbolValue): boolean => {
        const result = !failIfInUse(symbolName);
        if (result) {
            varSymbols.set(symbolName, value);
            definitions.set(symbolName);
        }
        return result;
    };

    const persistentSymbol = (
        symbolName: string, value: SymbolValue
    ): DirectiveResult => {
        const expandedSymbolName = `${symbolName}${currentLine().symbolSuffix}`;
        if (!failIfInUse(expandedSymbolName, value)) {
            constSymbols.set(expandedSymbolName, value);
            counts.set(expandedSymbolName);
            definitions.set(expandedSymbolName);
        }
        return undefined;
    };

    const builtInSymbol = (symbolName: string, value: SymbolValue): void => {
        if (isInLists(symbolName)) {
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
        const expanded = `${symbolName}${currentLine().symbolSuffix}`;
        if (constSymbols.has(expanded)) {
            counts.increment(expanded, "keepHidden");
            return constSymbols.get(expanded)!;
        }
        if (constSymbols.has(symbolName)) {
            counts.increment(symbolName, "keepHidden");
            return constSymbols.get(symbolName)!;
        }
        return "";
    };

    const listValue = (symbolName: string): DiscreteType => {
        const value = internalValue(symbolName);
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
        "has": has,
        "failIfInUse": failIfInUse,
        "userSymbol": userSymbol,
        "persistentSymbol": persistentSymbol,
        "builtInSymbol": builtInSymbol,
        "deviceSymbol": deviceSymbol,
        "internalValue": internalValue,
        "deviceSymbolValue": deviceSymbolValue,
        "use": use,
        "count": counts.count,
        "list": list,
        "reset": reset
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
