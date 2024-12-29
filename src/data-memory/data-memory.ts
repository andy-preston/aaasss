import { Directive } from "../context/context.ts";
import { box } from "../coupling/boxed-value.ts";
import { failure } from "../failure/failures.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";

export const dataMemory = (properties: DevicePropertiesInterface) => {
    let stack = 0;
    let allocated = 0;

    const newAllocationSize = (plusBytes: number) =>
        stack + allocated + plusBytes;

    const reset = () => {
        stack = 0;
        allocated = 0;
    };

    const allocStack: Directive = (bytes: number) => {
        // It's entirely optional to allocate space for a stack.
        // but you can if you're worried that your RAM allocations might eat up
        // all the space.
        if (stack != 0) {
            return failure(undefined, "ram_stackAllocated", `${stack}`);
        }
        const check = properties.ramAddress(newAllocationSize(bytes));
        if (check.which == "failure") {
            return check;
        }
        stack = bytes;
        return box(`${bytes}`);
    };

    const alloc: Directive = (bytes: number) => {
        const startAddress = properties.ramAddress(allocated);
        if (startAddress.which == "failure") {
            return startAddress;
        }
        const check = properties.ramAddress(newAllocationSize(bytes));
        if (check.which == "failure") {
            return check;
        }
        allocated = allocated + bytes;
        return box(`${startAddress.value}`);
    };

    return {
        "reset": reset,
        "allocStack": allocStack,
        "alloc": alloc
    };
};

export type DataMemory = ReturnType<typeof dataMemory>;
