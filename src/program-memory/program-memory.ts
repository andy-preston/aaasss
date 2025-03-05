import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { NumberDirective } from "../directives/data-types.ts";
import { box, emptyBox, failure } from "../failure/failure-or-box.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithAddress } from "./line-types.ts";

const bytesToWords = (byteCount: number): number => byteCount / 2;

export const programMemory = (
    symbolTable: SymbolTable, device: DevicePropertiesInterface
) => {
    let address = 0;

    const resetState = () => {
        address = 0;
    };

    const pastEnd = (newAddress: number) => {
        const bytes = device.numericValue("programMemoryBytes");
        if (bytes.which == "failure") {
            return bytes.kind == "device_notSelected"
                ? failure(undefined, "programMemory_sizeUnknown", undefined)
                : bytes;
        }
        const words = bytes.value / 2
        return newAddress > words
            ? failure(undefined, "programMemory_outOfRange", [`${words}`])
            : emptyBox();
    };

    const origin = (newAddress: number) => {
        const check = validNumeric(newAddress, "type_positive");
        if (check.which == "failure") {
            return check;
        }
        if (newAddress == 0) {
            address = 0;
            return box("");
        }
        const tooBig = pastEnd(newAddress);
        if (tooBig.which == "failure") {
            return tooBig;
        }
        address = newAddress;
        return box("");
    };

    const originDirective: NumberDirective = {
        "type": "numberDirective",
        "body": origin
    };

    const addressed = (line: LineWithObjectCode) => {
        if (line.label) {
            const result = symbolTable.add(
                line.label,
                { "type": "number", "body": address },
                line.fileName, line.lineNumber
            );
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
        "resetState": resetState,
        // "address" isn't used in the code but it's extremely simple and it's
        // being there makes tests SO much simpler. I'm not sure if that is
        // haram or not but I'm keeping it, at least for now.
        "address": () => address,
        "originDirective": originDirective,
        "addressed": addressed
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
