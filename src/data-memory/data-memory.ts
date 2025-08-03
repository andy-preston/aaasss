import type { Pass, PipelineReset } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { assertionFailure, boringFailure } from "../failure/bags.ts";

export const dataMemory = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    let stack = 0;
    let allocated = 0;

    const availableAddress = (): number | undefined => {
        const ramStart = symbolTable.deviceSymbolValue("ramStart", "number");
        return typeof ramStart != "number" ? undefined : ramStart + allocated;
    };

    const pastEnd = (bytesRequested: number): boolean => {
        const currentAddress = availableAddress();
        const ramEnd = symbolTable.deviceSymbolValue("ramEnd", "number");
        if (currentAddress == undefined || typeof ramEnd != "number") {
            currentLine().failures(boringFailure(
                "ram_sizeUnknown"
            ));
            return false;
        }

        const bytesAvailable = ramEnd - stack - currentAddress;
        if (bytesRequested <= bytesAvailable) {
            return false;
        }

        currentLine().failures(assertionFailure(
            "ram_outOfRange", `${bytesAvailable}`, `${bytesRequested}`
        ));
        return true;
    }

    const alloc = (symbolName: string, bytes: number): DirectiveResult => {
        symbolTable.persistentSymbol(
            symbolName, pastEnd(bytes) ? 0 : availableAddress()!
        );
        allocated = allocated + bytes;
        return undefined;
    };

    const allocStack = (bytes: number): DirectiveResult => {
        // It's entirely optional to allocate space for a stack.
        // but you can if you're worried that your RAM allocations might eat up
        // all the space.
        // On AVRs, the stack is at RamEnd and grows down!
        if (stack != 0) {
            currentLine().failures(boringFailure(
                "ram_stackAllocated"
            ));
        } else {
            stack = pastEnd(bytes) ? 0 : bytes;
        }
        return undefined;
    };

    const reset: PipelineReset = (_: Pass) => {
        stack = 0;
        allocated = 0;
    };

    return {
        "alloc": alloc,
        "allocStack": allocStack,
        "reset": reset
    };
};

export type DataMemory = ReturnType<typeof dataMemory>;
