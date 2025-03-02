import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { ObsoleteDirective } from "../directives/data-types.ts";
import { box, failure } from "../failure/failure-or-box.ts";

export const dataMemory = (device: DevicePropertiesInterface) => {
    let stack = 0;
    let allocated = 0;

    const newAllocationSize = (plusBytes: number) =>
        stack + allocated + plusBytes;

    const resetState = () => {
        stack = 0;
        allocated = 0;
    };

    const ramAddress = (plusBytes: number) => {
        const ramStart = device.numericValue("ramStart");
        const ramEnd = device.numericValue("ramEnd");
        if (ramStart.which == "failure" || ramEnd.which == "failure") {
            return failure(undefined, "ram_sizeUnknown", undefined);
        }
        const address = ramStart.value + plusBytes;
        return address > ramEnd.value
            ? failure(undefined, "ram_outOfRange", [`${address}`])
            : box(address);
    };

    const allocStackDirective: ObsoleteDirective = {
        "type": "directive",
        "body": (bytes: number) => {
            // It's entirely optional to allocate space for a stack.
            // but you can if you're worried that your RAM allocations might eat up
            // all the space.
            if (stack != 0) {
                return failure(undefined, "ram_stackAllocated", [`${stack}`]);
            }
            const check = ramAddress(newAllocationSize(bytes));
            if (check.which == "failure") {
                return check;
            }
            stack = bytes;
            return box(`${bytes}`);
        }
    };

    const allocDirective: ObsoleteDirective = {
        "type": "directive",
        "body": (bytes: number) => {
            const startAddress = ramAddress(allocated);
            if (startAddress.which == "failure") {
                return startAddress;
            }

            const check = ramAddress(newAllocationSize(bytes));
            if (check.which == "failure") {
                return check;
            }

            allocated = allocated + bytes;
            return box(`${startAddress.value}`);
        }
    };

    return {
        "resetState": resetState,
        "allocStackDirective": allocStackDirective,
        "allocDirective": allocDirective
    };
};

export type DataMemory = ReturnType<typeof dataMemory>;
