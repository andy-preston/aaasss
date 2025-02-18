import type { Pass } from "../assembler/pass.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { Directive } from "../directives/data-types.ts";
import type { DirectiveList } from "../directives/directive-list.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { MacroInvocation } from "../macros/data-types.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";

type UserFunction = MacroInvocation;

export const symbolTable = (
    directiveList: DirectiveList,
    deviceProperties: DevicePropertiesInterface,
    cpuRegisters: CpuRegisters,
    pass: Pass
) => {
    type UsageCount = number;
    type SymbolValue = number | string | UserFunction;
    type MapEntry = [UsageCount, SymbolValue];
    type SymbolMap = Map<string, MapEntry>;

    const symbols: SymbolMap = new Map([]);

    const has = (symbolName: string) =>
        symbols.has(symbolName) ||
        directiveList.has(symbolName) ||
        deviceProperties.has(symbolName) ||
        cpuRegisters.has(symbolName);

    const add = (symbolName: string, value: SymbolValue) => {
        if (directiveList.has(symbolName)) {
            return failure(undefined, "symbol_nameIsDirective", undefined);
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

    const use = (symbolName: string) => {

        const valueAndUsage = (): MapEntry => {
            // If a symbol has already been used, it's in the symbol table
            // with a usage count
            if (symbols.has(symbolName)) {
                return symbols.get(symbolName)!;
            }
            // Otherwise, it's definitely going to be in a property
            const property = deviceProperties.value(symbolName);
            if (property.which == "box") {
                return [0, property.value];
            }
            // or definitely a CPU register
            return [0, cpuRegisters.value(symbolName)!]
        };

        // Directives don't get counted.
        if (directiveList.has(symbolName)) {
            return directiveList.use(symbolName);
        }
        const [usageCount, value] = valueAndUsage();
        symbols.set(symbolName, [usageCount + 1, value]);
        return value;
    };

    const reset = () => {
        for (const [symbolName, [_usageCount, value]] of symbols) {
            symbols.set(symbolName, [0, value]);
        }
    };

    const value = (symbolName: string) => {
        const [_usageCount, value] = symbols.get(symbolName)!;
        return ["string", "number"].includes(typeof value)
            ? `${value}`
            : null;
    };

    const count = (symbolName: string) => {
        const theSymbol = symbols.get(symbolName);
        if (theSymbol == undefined) {
            return 0;
        }
        const [usageCount, _value] = theSymbol;
        return usageCount;
    }

    // This is the directive FOR defining symbols
    // not an imperatively named function TO define directives.
    const defineDirective: Directive = (symbolName: string, value: number) =>
        add(symbolName, value);

    return {
        "has": has,
        "add": add,
        "use": use,
        "value": value,
        "count": count,
        "reset": reset,
        "empty": () => symbols.size == 0,
        "list": () => symbols.keys(),
        "defineDirective": defineDirective,
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
