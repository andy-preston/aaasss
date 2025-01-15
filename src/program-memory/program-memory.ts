import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { Directive } from "../directives/data-types.ts";
import { positiveParameter } from "../directives/type-checking.ts";
import { box } from "../failure/failure-or-box.ts";
import type { Context } from "../javascript/context.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import { lineWithAddress } from "./line-types.ts";

const bytesToWords = (byteCount: number): number => byteCount / 2;

export const programMemory = (
    context: Context,
    properties: DevicePropertiesInterface
) => {
    let address = 0;

    const reset = () => {
        address = 0;
    }

    const origin: Directive = (newAddress: number) => {
        const check = positiveParameter(newAddress);
        if (check.which == "failure") {
            return check;
        }
        if (newAddress == 0) {
            address = 0;
            return box(`${address}`);
        }
        const pastEnd = properties.programMemoryEnd(newAddress);
        if (pastEnd.which == "failure") {
            return pastEnd;
        }
        address = newAddress;
        return box(`${address}`);
    };

    const pipeline = (line: LineWithObjectCode) => {
        if (line.label) {
            const result = context.property(line.label, address);
            if (result.which == "failure") {
                line.withFailure(result);
            }
        }

        const newLine = lineWithAddress(line, address);

        const newAddress = bytesToWords(line.code.reduce(
            (accumulated, codeBlock) => accumulated + codeBlock.length,
            0
        )) + address;
        const step = origin(newAddress);
        if (step.which == "failure") {
            newLine.withFailure(step);
        }

        return newLine;
    };

    return {
        "reset": reset,
        // "address" isn't used in the code but it's extremely simple and it's
        // being there makes tests SO much simpler. I'm not sure if that is
        // haram or not but I'm keeping it, at least for now.
        "address": () => address,
        "origin": origin,
        "pipeline": pipeline
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
