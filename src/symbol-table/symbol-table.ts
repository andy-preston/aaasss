import type { Pass } from "../assembler/pass.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { Directive } from "../directives/data-types.ts";
import type { DirectiveList } from "../directives/directive-list.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { MapEntry, SymbolValue } from "./data-types.ts";


export const symbolTable = (
    directiveList: DirectiveList,
    deviceProperties: DevicePropertiesInterface,
    cpuRegisters: CpuRegisters,
    pass: Pass
) => {
    const symbols: Map<string, MapEntry> = new Map([]);

    const has = (
        symbolName: string, option: "withRegisters" | "notRegisters"
    ) => {
        const isRegister = cpuRegisters.has(symbolName);
        const hasSymbol = symbols.has(symbolName) ||
            directiveList.has(symbolName) || deviceProperties.has(symbolName);
        return hasSymbol && (
            (option == "withRegisters" && isRegister) ||
            (option == "notRegisters" && !isRegister)
        );
    };

    const add = (symbolName: string, value: SymbolValue) => {
        if (directiveList.has(symbolName)) {
            return failure(undefined, "symbol_nameIsDirective", undefined);
        }

        if (cpuRegisters.has(symbolName)) {
            return failure(undefined, "symbol_nameIsRegister", undefined);
        }

        if (deviceProperties.has(symbolName)) {
            return failure(undefined, "symbol_alreadyExists", undefined);
        }

        if (symbols.has(symbolName) && !pass.ignoreErrors()) {
            const [_usageCount, oldValue] = symbols.get(symbolName)!;
            if (value != oldValue) {
                return failure(undefined, "symbol_alreadyExists", [`${oldValue}`]);
            }
        }

        if (!symbols.has(symbolName)) {
            symbols.set(symbolName, [0, value]);
        }
        return emptyBox();
    };

    const countedSymbol = (symbolName: string): MapEntry => {
        if (symbols.has(symbolName)) {
            return symbols.get(symbolName)!;
        }

        const property = deviceProperties.value(symbolName);
        if (property.which == "box") {
            return [0, property.value];
        }

        return [0, cpuRegisters.value(symbolName)!]
    };

    const use = (symbolName: string) => {
        if (directiveList.has(symbolName)) {
            return directiveList.use(symbolName);
        }

        const [usageCount, value] = countedSymbol(symbolName);
        symbols.set(symbolName, [usageCount + 1, value]);
        return value;
    };

    const resetState = () => {
        for (const [symbolName, [_usageCount, value]] of symbols) {
            symbols.set(symbolName, [0, value]);
        }
    };

    const value = (symbolName: string) => {
        const theSymbol = symbols.get(symbolName);
        return theSymbol == undefined ? [0, undefined] : theSymbol;
    }

    const defineDirective: Directive = (symbolName: string, value: number) =>
        add(symbolName, value);

    return {
        "has": has,
        "add": add,
        "use": use,
        "value": value,
        "resetState": resetState,
        "list": () => symbols.entries().toArray(),
        "defineDirective": defineDirective,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
