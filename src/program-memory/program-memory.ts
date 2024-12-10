import type { Context } from "../context/context.ts";
import {
    box, failure, type Box, type Failure
} from "../coupling/value-failure.ts";
import type { DeviceProperties } from "../device/properties.ts";
import { LineWithProcessedMacro } from "../macro/line-types.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import { lineWithAddress } from "./line-types.ts";

const bytesToWords = (byteCount: number): number => byteCount / 2;

export const programMemory = (
    context: Context,
    properties: DeviceProperties
) => {
    let address = 0;

    const reset = () => {
        address = 0;
    }

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

    const step = (line: LineWithObjectCode): Box<number> | Failure => {
        const newAddress = bytesToWords(line.code.reduce(
            (accumulated, codeBlock) => accumulated + codeBlock.length,
            address
        ));
        return origin(newAddress);
    };

    const label = (line: LineWithProcessedMacro) => {
        if (line.label) {
            const result = context.property(line.label, address);
            if (result.which == "failure") {
                line.addFailures([result]);
            }
        }
        return lineWithAddress(line, address, []);
    };

    return {
        "reset": reset,
        // "address" isn't used in the code but it's extremely simple and it's
        // being there makes tests SO much simpler. I'm not sure if that is
        // haram or not but I'm keeping it, at least for now.
        "address": () => address,
        "origin": origin,
        "label": label,
        "step": step
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
