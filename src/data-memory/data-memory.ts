import { emptyBag, numberBag, stringBag, type NumberBag } from "../assembler/bags.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { NumberDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { bagOfFailures, boringFailure, memoryRangeFailure, type Failure, type NumberOrFailures } from "../failure/bags.ts";

export const dataMemory = (device: DevicePropertiesInterface) => {
    let stack = 0;
    let allocated = 0;

    const resetState = () => {
        stack = 0;
        allocated = 0;
    };

    const availableAddress = (bytesRequested: number): NumberOrFailures => {
        const ramStart = device.numericValue("ramStart");
        const ramEnd = device.numericValue("ramEnd");
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
        return bytesRequested > bytesAvailable ? bagOfFailures([
            memoryRangeFailure("ram_outOfRange", bytesAvailable, bytesRequested)
        ]) : numberBag(currentAddress);
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

    return {
        "resetState": resetState,
        "allocStackDirective": allocStackDirective,
        "allocDirective": allocDirective
    };
};

export type DataMemory = ReturnType<typeof dataMemory>;
