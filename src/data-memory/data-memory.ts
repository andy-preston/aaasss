import { numberBag, stringBag, type NumberBag } from "../assembler/bags.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import { NumberDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { failure, bagOfFailures, type Failure, type NumberOrFailures } from "../failure/bags.ts";

export const dataMemory = (device: DevicePropertiesInterface) => {
    let stack = 0;
    let allocated = 0;

    const newAllocationSize = (plusBytes: number) =>
        stack + allocated + plusBytes;

    const resetState = () => {
        stack = 0;
        allocated = 0;
    };

    const ramAddress = (plusBytes: number): NumberOrFailures => {
        const ramStart = device.numericValue("ramStart");
        const ramEnd = device.numericValue("ramEnd");
        const failures: Array<Failure> = (
            ramStart.type == "failures" ? ramStart.it : []
        ).concat(
            ramEnd.type == "failures" ? ramEnd.it : []
        );
        if (failures.length > 0) {
            failures.push(failure(undefined, "ram_sizeUnknown", undefined))
            return bagOfFailures(failures);
        };

        const address = (ramStart as NumberBag).it + plusBytes;
        return address > (ramEnd as NumberBag).it
            ? bagOfFailures([failure(undefined, "ram_outOfRange", [`${address}`])])
            : numberBag(address);
    };

    const allocStack = (bytes: number): DirectiveResult => {
        // It's entirely optional to allocate space for a stack.
        // but you can if you're worried that your RAM allocations might eat up
        // all the space.
        if (stack != 0) {
            return bagOfFailures([failure(undefined, "ram_stackAllocated", [`${stack}`])]);
        }
        const check = ramAddress(newAllocationSize(bytes));
        if (check.type == "failures") {
            return check;
        }
        stack = bytes;
        return stringBag(`${bytes}`);
    };

    const allocStackDirective: NumberDirective = {
        "type": "numberDirective", "it": allocStack
    };

    const alloc = (bytes: number): DirectiveResult => {
        const startAddress = ramAddress(allocated);
        if (startAddress.type == "failures") {
            return startAddress;
        }

        const check = ramAddress(newAllocationSize(bytes));
        if (check.type == "failures") {
            return check;
        }

        allocated = allocated + bytes;
        return stringBag(`${startAddress.it}`);
    };

    const allocDirective: NumberDirective = {
        "type": "numberDirective", "it": alloc
    };

    return {
        "resetState": resetState,
        "allocStackDirective": allocStackDirective,
        "allocDirective": allocDirective
    };
};

export type DataMemory = ReturnType<typeof dataMemory>;
