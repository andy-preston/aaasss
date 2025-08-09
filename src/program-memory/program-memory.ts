import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { Failure } from "../failure/failures.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { assertionFailure, boringFailure, numericTypeFailure } from "../failure/failures.ts";
import { DirectiveResult } from "../directives/data-types.ts";
import { Label } from "../tokens/data-types.ts";

export const programMemory = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    let address = 0;

    const pastEnd = (newAddress: number): Failure | undefined => {
        const bytesAvailable = symbolTable.deviceSymbolValue(
            "programMemoryBytes", "number"
        );
        if (bytesAvailable == undefined) {
            return boringFailure("programMemory_sizeUnknown");
        }

        const wordsAvailable = bytesAvailable as number / 2;
        if (newAddress > wordsAvailable) {
            return assertionFailure(
                "programMemory_outOfRange", `${wordsAvailable}`, `${newAddress}`
            );
        }
        return;
    };

    const absoluteAddress = (
        address: number, bits: number
    ): number | Failure => {
        const tooFar = pastEnd(address);
        if (tooFar) {
            return tooFar;
        }

        const range = Math.pow(2, bits);
        if (address > range) {
            return assertionFailure(
                "programMemory_outOfRange", `0-${range}`, `${address}`
            );
        }

        return address;
    };

    const relativeAddress = (
        absoluteAddress: number, bits: number
    ): number | Failure => {
        const tooFar = pastEnd(absoluteAddress);
        if (tooFar) {
            return tooFar;
        }

        const range = Math.pow(2, bits);
        const max = range / 2;
        const min = -max + 1;
        const distance = absoluteAddress - address - 1;
        if (distance < min || distance >= max) {
            return numericTypeFailure(
                "type_relativeAddress", distance, min, max, []
            );
        }

        return distance < 0 ? range + distance : distance;
    };

    const setAddress = (newAddress: number): Failure | undefined => {
        if (newAddress == 0) {
            address = 0;
            return;
        }

        const tooFar = pastEnd(newAddress)
        if (tooFar) {
            return tooFar;
        }

        address = newAddress;
        return;
    }

    const origin = (newAddress: number): DirectiveResult => {
        if (currentLine().code.length > 0) {
            currentLine().failures(boringFailure("programMemory_cantOrg"));
            return undefined;
        }

        if (newAddress < 0) {
            const negative = numericTypeFailure(
                "type_positive", newAddress, 0, undefined, undefined
            );
            negative.location = {"parameter": 1};
            currentLine().failures(negative);
            return undefined;
        }

        const tooFar = setAddress(newAddress);
        if (tooFar) {
            tooFar.location = {"parameter": 1};
            currentLine().failures(tooFar);
            return undefined;
        }

        currentLine().address = address;
        return undefined;
    };

    const lineAddress: PipelineProcess = () => {
        currentLine().address = address;
    };

    const reset: PipelineReset = () => {
        address = 0;
    };

    const label = (labelName: Label): DirectiveResult => {
        symbolTable.persistentSymbol(labelName, address);
        return undefined;
    };

    const lineLabel: PipelineProcess = () => {
        if (currentLine().label) {
            label(currentLine().label);
        }
    };

    const addressStep = (steps: number) => {
        const failed = setAddress(address + steps);
        if (failed) {
            currentLine().failures(failed);
        }
    };

    return {
        "absoluteAddress": absoluteAddress,
        "relativeAddress": relativeAddress,
        "address": () => address,
        "origin": origin,
        "addressStep": addressStep,
        "label": label,
        "lineAddress": lineAddress,
        "lineLabel": lineLabel,
        "reset": reset
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
