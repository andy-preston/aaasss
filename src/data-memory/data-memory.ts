import type { NumberBag } from "../assembler/bags.ts";
import type { ImmutableLine } from "../assembler/line.ts";
import type { NumberDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { Failure, NumberOrFailures } from "../failure/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { emptyBag, numberBag, stringBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure } from "../failure/bags.ts";

export const dataMemory = (symbolTable: SymbolTable) => {
    let stack = 0;
    let allocated = 0;

    const availableAddress = (bytesRequested: number): NumberOrFailures => {
        const ramStart = symbolTable.deviceSymbolValue("ramStart", "number");
        const ramEnd = symbolTable.deviceSymbolValue("ramEnd", "number");
        const failures: Array<Failure> = (
            ramStart.type == "failures" ? ramStart.it : []
        ).concat(
            ramEnd.type == "failures" ? ramEnd.it : []
        );
        if (failures.length > 0) {
            failures.push(boringFailure("ram_sizeUnknown"));
            return bagOfFailures(failures);
        };

        const startAddress = (ramStart as NumberBag).it;
        const endAddress = (ramEnd as NumberBag).it;
        const currentAddress = startAddress + allocated;
        const bytesAvailable = endAddress - stack - currentAddress;
        return bytesRequested > bytesAvailable
            ? bagOfFailures([assertionFailure(
                "ram_outOfRange", `${bytesAvailable}`, `${bytesRequested}`
            )])
            : numberBag(currentAddress);
    };

    const alloc = (bytes: number): DirectiveResult => {
        const startAddress = availableAddress(bytes);
        if (startAddress.type == "failures") {
            return startAddress;
        }
        allocated = allocated + bytes;
        return stringBag(`${startAddress.it}`);
    };

    const allocDirective: NumberDirective = {
        "type": "numberDirective", "it": alloc
    };

    const allocStack = (bytes: number): DirectiveResult => {
        // It's entirely optional to allocate space for a stack.
        // but you can if you're worried that your RAM allocations might eat up
        // all the space.
        // On AVRs, the stack is at RamEnd and grows down!
        if (stack != 0) {
            return bagOfFailures([boringFailure("ram_stackAllocated")]);
        }
        const check = availableAddress(bytes);
        if (check.type == "failures") {
            return check;
        }
        stack = bytes;
        return emptyBag();
    };

    const allocStackDirective: NumberDirective = {
        "type": "numberDirective", "it": allocStack
    };

    const assemblyPipeline = function* (
        lines: IterableIterator<ImmutableLine>
    ) {
        for (const line of lines) {
            yield line;
            if (line.lastLine) {
                stack = 0;
                allocated = 0;
            }
        }
    };

    return {
        "allocDirective": allocDirective,
        "allocStackDirective": allocStackDirective,
        "assemblyPipeline": assemblyPipeline
    };
};

export type DataMemory = ReturnType<typeof dataMemory>;
