import type { Code } from "../coupling/line.ts";
import type { DeviceProperties } from "../device/properties.ts";
import { box, failure, type Box, type Failure } from "../value-or-failure.ts";

export const programMemory = (properties: DeviceProperties) => {
    let address = 0;

    const origin = (newAddress: number): Box<number> | Failure => {
        if (newAddress < 0) {
            return failure(undefined, "address.negative", `${newAddress}`);
        }
        if (newAddress == 0) {
            address = 0;
            return box(address);
        }
        const pastEnd = properties.public.programMemoryEnd(newAddress);
        if (pastEnd.which == "failure") {
            return pastEnd;
        }
        address = newAddress;
        return box(address);
    };

    const step = (code: Code): Box<number> | Failure => {
        // Flash addresses are in 16-bit words, not bytes
        address += code.length / 2;
        const pastEnd = properties.public.programMemoryEnd(address);
        if (pastEnd.which == "failure") {
            return pastEnd;
        }
        return box(address);
    };

    return {
        "address": () => address,
        "origin": origin,
        "step": step
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
