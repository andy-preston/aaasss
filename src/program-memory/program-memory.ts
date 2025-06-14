import type { PipelineStage } from "../assembler/data-types.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { NumberOrFailures, StringOrFailures } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Line } from "../line/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { emptyBag, numberBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, numericTypeFailure } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";

export const programMemory = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    let address = 0;

    const pastEnd = (newAddress: number): StringOrFailures => {
        const bytesAvailable = symbolTable.deviceSymbolValue(
            "programMemoryBytes", "number"
        );
        const failures = bytesAvailable.type == "failures"
            ? bytesAvailable
            : bagOfFailures([]);
        if (bytesAvailable.type != "number") {
            failures.it.push(boringFailure("programMemory_sizeUnknown"));
        } else {
            const wordsAvailable = bytesAvailable.it / 2;
            if (newAddress > wordsAvailable) {
                failures.it.push(assertionFailure(
                    "programMemory_outOfRange",
                    `${wordsAvailable}`, `${newAddress}`
                ));
            }
        }
        return failures.it.length > 0 ? failures : emptyBag();
    };

    const absoluteAddress = (
        address: number, bits: number
    ): NumberOrFailures => {
        const inRange = pastEnd(address);
        if (inRange.type == "failures") {
            return bagOfFailures(inRange.it);
        }
        const range = Math.pow(2, bits);
        if (address > range) {
            return bagOfFailures([assertionFailure(
                "value_type", `0-${range}`, `${address}`
            )]);
        }
        return numberBag(address);
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
            return bagOfFailures([numericTypeFailure(
                "type_relativeAddress", distance, min, max, []
            )]);
        }

        return numberBag(distance < 0 ? range + distance : distance);
    };

    const setAddress = (newAddress: number): DirectiveResult => {
        const negative = validNumeric(newAddress, "type_positive");
        if (negative.type == "failures") {
            return negative;
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
    }

    const origin = (newAddress: number): DirectiveResult => {
        const theLine = currentLine.directiveBackdoor();
        if (theLine.code.length > 0) {
            theLine.failures.push(boringFailure("programMemory_cantOrg"));
            return emptyBag();
        }

        const result = setAddress(newAddress);
        if (result.type == "failures") {
            result.it.forEach(failure => {
                failure.location = { "parameter": 0 };
                theLine.failures.push(failure);
            })
        } else {
            theLine!.address = address;
        }
        return emptyBag();
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

    const addressStep = (steps: number) => setAddress(address + steps);

    return {
        "absoluteAddress": absoluteAddress,
        "relativeAddress": relativeAddress,
        "address": () => address,
        "origin": origin,
        "label": label,
        "addressStep": addressStep,
        "lineAddress": lineAddress,
        "lineLabel": lineLabel
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
