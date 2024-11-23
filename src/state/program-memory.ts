import type { Code } from "../coupling/line.ts";
import type { DeviceProperties } from "../device/properties.ts";
import { box, failure, type Box, type Failure } from "../value-or-failure.ts";

export const newProgramMemory = (properties: DeviceProperties) => {
    let address = 0;

    const reset = () => {
        address = 0;
    }

    const origin = (wordAddress: number): Box<number> | Failure => {
        if (wordAddress < 0) {
            return failure(undefined, "address.negative", `${wordAddress}`);
        }
        if (wordAddress == 0) {
            address = 0;
            return box(address);
        }
        const pastEnd = properties.public.programMemoryEnd(wordAddress);
        if (pastEnd.which == "failure") {
            return pastEnd;
        }
        address = wordAddress;
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
        "reset": reset,
        "address": () => address,
        "origin": origin,
        "step": step
    };
};

export type ProgramMemory = ReturnType<typeof newProgramMemory>;
