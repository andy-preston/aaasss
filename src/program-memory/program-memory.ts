import { emptyBag, numberBag } from "../assembler/bags.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { NumberDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { bagOfFailures, type StringOrFailures } from "../failure/bags.ts";
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

    const pastEnd = (newAddress: number): StringOrFailures => {
        const bytes = device.numericValue("programMemoryBytes");
        if (bytes.type == "failures") {
            const notSelected = bytes.it.find(
                failure => failure.kind == "device_notSelected"
            );
            if (notSelected != undefined) {
                bytes.it.push({ "kind": "programMemory_sizeUnknown" });
            }
            return bytes;
        }

        const words = bytes.it / 2
        return newAddress > words ? bagOfFailures([{
            "kind": "programMemory_outOfRange",
            "newAddress": newAddress, "wordsAvailable": words
        }]) : emptyBag()
    };

    const origin = (newAddress: number): DirectiveResult => {
        const check = validNumeric(newAddress, "type_positive");
        if (check.type == "failures") {
            return check;
        }
        if (newAddress == 0) {
            address = 0;
            return emptyBag();
        }
        const tooBig = pastEnd(newAddress);
        if (tooBig.type == "failures") {
            return tooBig;
        }
        address = newAddress;
        return emptyBag();
    };

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": origin
    };

    const addressed = (line: LineWithObjectCode) => {
        if (line.label) {
            const result = symbolTable.add(
                line.label, numberBag(address),
                line.fileName, line.lineNumber
            );
            if (result.type == "failures") {
                line.withFailures(result.it);
            }
        }

        const newLine = lineWithAddress(line, address);

        const newAddress = bytesToWords(line.code.reduce(
            (accumulated, codeBlock) => accumulated + codeBlock.length,
            0
        )) + address;

        const step = origin(newAddress);
        if (step.type == "failures") {
            newLine.withFailures(step.it);
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
