import type { DirectiveResult } from "../directives/data-types.ts";
import type { NumberOrFailures, StringOrFailures } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { emptyBag, numberBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, numericTypeFailure, withLocation } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import { lineWithAddress } from "./line-types.ts";

const bytesToWords = (byteCount: number): number => byteCount / 2;

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
        return theLine != undefined && theLine.code.length > 0
            ? bagOfFailures([boringFailure("programMemory_cantOrg")])
            : setAddress(newAddress);
    };

    const label = (symbolName: string): DirectiveResult =>
        symbolTable.persistentSymbol(symbolName, numberBag(address));

    const addressStep = (line: LineWithObjectCode) => {
        if (line.label) {
            const result = label(line.label);
            if (result.type == "failures") {
                line.withFailures(result.it);
            }
        }

        const newLine = lineWithAddress(line, address);

        const newAddress = bytesToWords(line.code.reduce(
            (accumulated, codeBlock) => accumulated + codeBlock.length,
            0
        )) + address;

        const step = setAddress(newAddress);
        if (step.type == "failures") {
            newLine.withFailures(step.it);
        }

        return newLine;
    };

    const reset = (line: LineWithObjectCode) => {
        if (line.lastLine) {
            address = 0;
        }
    };

    return {
        "relativeAddress": relativeAddress,
        "address": () => address,
        "origin": origin,
        "label": label,
        "addressStep": addressStep,
        "reset": reset
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
