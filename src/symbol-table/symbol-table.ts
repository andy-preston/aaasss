import type { Pass } from "../assembler/pass.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { ValueDirective } from "../directives/data-types.ts";
import type { DirectiveList } from "../directives/directive-list.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { box, emptyBox, failure } from "../failure/failure-or-box.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { FileName, LineNumber } from "../source-code/data-types.ts";
import type { SymbolValue } from "./data-types.ts";

export const symbolTable = (
    directiveList: DirectiveList,
    deviceProperties: DevicePropertiesInterface,
    cpuRegisters: CpuRegisters,
    pass: Pass
) => {
    const values: Map<string, SymbolValue> = new Map();

    const counts: Map<string, number> = new Map();

    const definitionLocations: Map<string, string> = new Map();

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

    const inOtherLists = (symbolName: string) =>
        directiveList.has(symbolName)
            ? failure(undefined, "symbol_nameIsDirective", undefined)
            : cpuRegisters.has(symbolName)
            ? failure(undefined, "symbol_nameIsRegister", undefined)
            : deviceProperties.has(symbolName)
            ? failure(undefined, "symbol_alreadyExists", undefined)
            : emptyBox();

    const add = (
        symbolName: string, value: SymbolValue,
        fileName: FileName, lineNumber: LineNumber
    ) => {
        const inUse = inOtherLists(symbolName);
        if (inUse.which == "failure") {
            return inUse;
        }

        if (values.has(symbolName) && !pass.ignoreErrors()) {
            const existing = values.get(symbolName)!.body;
            if (value.body != existing) {
                return failure(
                    undefined, "symbol_alreadyExists", [`${existing}`]
                );
            }
        }

        values.set(symbolName, value);
        counts.set(symbolName, 0);
        definitionLocations.set(
            symbolName, fileName ? `${fileName}:${lineNumber}` : ""
        );
        return box("");
    };

    const resetState = () => {
        counts.clear();
    };

    const count = (symbolName: string) => {
        const result = counts.get(symbolName);
        return result == undefined ? 0 : result;
    };

    const increment = (symbolName: string) => {
        counts.set(symbolName, count(symbolName) + 1);
    }

    const use = (symbolName: string): SymbolValue => {
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
            return {
                "type": "string",
                "body": property.value
            };
        }

        increment(symbolName);
        return {
            "type": "number",
            "body": cpuRegisters.value(symbolName)
        };
    };

    const notCounted = (symbolName: string) => values.get(symbolName)!;

    const listValue = (symbolName: string) => {
        const property = deviceProperties.value(symbolName);
        if (property.which == "box") {
            return property.value;
        }
        const fromList = notCounted(symbolName);
        return fromList != undefined
            && (fromList.type == "string" || fromList.type == "number")
            ? fromList.body
            : undefined;
    };

    const listDefinition = (symbolName: string) => {
        const fromList = definitionLocations.get(symbolName);
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

    const defineDirective: ValueDirective = {
        "type": "valueDirective",
        "body": (symbolName: string, value: number) => add(
            symbolName, { "type": "number", "body": value },
            currentFileName(), currentLineNumber()
        )
    };

    return {
        "has": has,
        "add": add,
        "use": use,
        "notCounted": notCounted,
        "count": count,
        "list": list,
        "resetState": resetState,
        "defineDirective": defineDirective,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
