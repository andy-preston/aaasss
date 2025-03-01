import type { Pass } from "../assembler/pass.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { Directive } from "../directives/data-types.ts";
import type { DirectiveList } from "../directives/directive-list.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { FileName, LineNumber } from "../source-code/data-types.ts";
import type { SymbolResult, SymbolValue } from "./data-types.ts";

export const symbolTable = (
    directiveList: DirectiveList,
    deviceProperties: DevicePropertiesInterface,
    cpuRegisters: CpuRegisters,
    pass: Pass
) => {
    const values: Map<string, SymbolValue> = new Map([]);
    const counts: Map<string, number> = new Map([]);
    const definitions: Map<string, string> = new Map([]);

    const has = (
        symbolName: string, option: "withRegisters" | "notRegisters"
    ) => {
        const isRegister = cpuRegisters.has(symbolName);
        const hasSymbol = values.has(symbolName) ||
            directiveList.has(symbolName) || deviceProperties.has(symbolName);
        return hasSymbol && (
            (option == "withRegisters" && isRegister) ||
            (option == "notRegisters" && !isRegister)
        );
    };

    const add = (
        symbolName: string, value: SymbolValue,
        fileName: FileName, lineNumber: LineNumber
    ) => {
        if (directiveList.has(symbolName)) {
            return failure(undefined, "symbol_nameIsDirective", undefined);
        }

        if (cpuRegisters.has(symbolName)) {
            return failure(undefined, "symbol_nameIsRegister", undefined);
        }

        if (deviceProperties.has(symbolName)) {
            return failure(undefined, "symbol_alreadyExists", undefined);
        }

        if (values.has(symbolName) && !pass.ignoreErrors()) {
            const oldValue = values.get(symbolName);
            if (value != oldValue) {
                return failure(undefined, "symbol_alreadyExists", [`${oldValue}`]);
            }
        }

        values.set(symbolName, value);
        counts.set(symbolName, 0);
        definitions.set(symbolName, fileName ? `${fileName}:${lineNumber}` : "");
        return emptyBox();
    };

    const count = (symbolName: string) => {
        const result = counts.get(symbolName);
        return result == undefined ? 0 : result;
    };

    const increment = (symbolName: string) => {
        counts.set(symbolName, count(symbolName) + 1);
    }

    const fromLists = (symbolName: string): SymbolValue | Directive => {
        if (directiveList.has(symbolName)) {
            return directiveList.use(symbolName);
        }

        if (values.has(symbolName)) {
            increment(symbolName);
            return values.get(symbolName)!;
        }

        const property = deviceProperties.value(symbolName);
        if (property.which == "box") {
            increment(symbolName);
            return property.value;
        }

        increment(symbolName);
        return cpuRegisters.value(symbolName);
    };

    const use = (symbolName: string): SymbolResult => {
        const value = fromLists(symbolName);
        return typeof value == "number"
            ? { "type": "number", "value": value }
            : typeof value == "string"
            ? { "type": "string", "value": value }
            : { "type": "function", "value": value }
    };

    const resetState = () => {
        counts.clear();
    };

    const value = (symbolName: string) => {
        if (values.has(symbolName)) {
            return values.get(symbolName)!;
        }

        const property = deviceProperties.value(symbolName);
        if (property.which == "box") {
            return property.value;
        }

        return cpuRegisters.value(symbolName);
    };

    const list = () => {
        const asArray: Array<[string, number, SymbolValue, string]> = [];
        counts.forEach((count: number, symbolName: string) => {
            const definition = definitions.get(symbolName);
            asArray.push([
                symbolName, count, value(symbolName),
                definition == undefined ? "" : definition
            ]);
        });
        return asArray;
    }

    const defineDirective: Directive = (symbolName: string, value: number) =>
        add(symbolName, value, currentFileName(), currentLineNumber());

    return {
        "has": has,
        "add": add,
        "use": use,
        "count": count,
        "list": list,
        "resetState": resetState,
        "defineDirective": defineDirective,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
