import { emptyBag, numberBag } from "../assembler/bags.ts";
import type { NumberDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import {
    bagOfFailures, boringFailure, memoryRangeFailure,
    type StringOrFailures
} from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithAddress } from "./line-types.ts";

const bytesToWords = (byteCount: number): number => byteCount / 2;

export const programMemory = (symbolTable: SymbolTable) => {
    let address = 0;

    const resetState = () => {
        address = 0;
    };

    const pastEnd = (newAddress: number): StringOrFailures => {
        const bytes = symbolTable.deviceSymbolValue(
            "programMemoryBytes", "number"
        );
        const failures = bytes.type == "failures" ? bytes : bagOfFailures([]);
        if (bytes.type == "number") {
            const words = bytes.it / 2;
            if (newAddress > words) {
                failures.it.push(memoryRangeFailure(
                    "programMemory_outOfRange",
                    bytes.it, (newAddress - address) * 2
                ));
            }
        } else {
            failures.it.push(boringFailure("programMemory_sizeUnknown"));
        }
        return failures.it.length > 0 ? failures : emptyBag();
    };

    const origin = (newAddress: number): DirectiveResult => {
        const check = validNumeric(newAddress, "type_positive");
        if (check.type == "failures") {
            check.it.forEach((failure) => {
                failure.location = { "parameter": 0 };
            });
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
            const result = symbolTable.persistentSymbol(
                line.label, numberBag(address)
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
