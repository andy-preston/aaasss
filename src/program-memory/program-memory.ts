import type { PipelineStage } from "../assembler/data-types.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { NumberOrFailures, StringOrFailures } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Line } from "../line/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { emptyBag, numberBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, numericTypeFailure, withLocation } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";

export const programMemory = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    let address = 0;

    const pastEnd = (newAddress: number): StringOrFailures => {
        const bytes = symbolTable.deviceSymbolValue(
            "programMemoryBytes", "number"
        );
        const failures = bytes.type == "failures" ? bytes : bagOfFailures([]);
        if (bytes.type == "number") {
            const words = bytes.it / 2;
            if (newAddress > words) {
                failures.it.push(assertionFailure(
                    "programMemory_outOfRange",
                    `${bytes.it / 2}`, `${newAddress - address}`
                ));
            }
        } else {
            failures.it.push(boringFailure("programMemory_sizeUnknown"));
        }
        return failures.it.length > 0 ? failures : emptyBag();
    };

    const relativeAddress = (
        absoluteAddress: number, bits: number
    ): NumberOrFailures => {
        const inRange = pastEnd(absoluteAddress);
        if (inRange.type == "failures") {
            return bagOfFailures(inRange.it);
        }

        const range = Math.pow(2, bits);
        const max = range / 2;
        const min = -max + 1;
        const distance = absoluteAddress - address - 1;
        if (distance < min || distance >= max) {
            return bagOfFailures([
                numericTypeFailure("type_relativeAddress", distance, min, max)
            ]);
        }

        return numberBag(distance < 0 ? range + distance : distance);
    };

    const setAddress = (newAddress: number): DirectiveResult => {
        const negative = validNumeric(newAddress, "type_positive");
        if (negative.type == "failures") {
            return withLocation(negative, { "parameter": 0 });
        }

        if (newAddress == 0) {
            address = 0;
            return emptyBag();
        }

        const tooBig = pastEnd(newAddress);
        if (tooBig.type == "failures") {
            return withLocation(tooBig, { "parameter": 0 });
        }

        address = newAddress;
        return emptyBag();
    }

    const origin = (newAddress: number): DirectiveResult => {
        const theLine = currentLine.directiveBackdoor();
        if (theLine != undefined && [...theLine.code].length > 0) {
            return bagOfFailures([boringFailure("programMemory_cantOrg")]);
        }

        const result = setAddress(newAddress);
        if (result.type != "failures") {
            theLine!.address = address;
        }
        return result;
    };

    const label = (symbolName: string): DirectiveResult =>
        symbolTable.persistentSymbol(symbolName, numberBag(address));

    const lineAddress: PipelineStage = (line: Line) => {
        line.address = address;
        if (line.lastLine) {
            address = 0;
        }
    };

    const lineLabel: PipelineStage = (line: Line) => {
        if (line.label) {
            const result = label(line.label);
            if (result.type == "failures") {
                line.withFailures(result.it);
            }
        }
        return line;
    };

    const addressPlusOne = () => setAddress(address + 1);

    return {
        "relativeAddress": relativeAddress,
        "address": () => address,
        "origin": origin,
        "label": label,
        "addressPlusOne": addressPlusOne,
        "lineAddress": lineAddress,
        "lineLabel": lineLabel
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
