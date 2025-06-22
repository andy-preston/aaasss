import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { Failure } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure, boringFailure, numericTypeFailure } from "../failure/bags.ts";

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

    const origin = (newAddress: number): void => {
        if (currentLine().code.length > 0) {
            addFailure(currentLine().failures, boringFailure(
                "programMemory_cantOrg"
            ));
            return;
        }

        if (newAddress < 0) {
            const negative = numericTypeFailure(
                "type_positive", newAddress, 0, undefined, undefined
            );
            negative.location = {"parameter": 1};
            addFailure(currentLine().failures, negative);
            return;
        }

        const tooFar = setAddress(newAddress);
        if (tooFar) {
            tooFar.location = {"parameter": 1};
            addFailure(currentLine().failures, tooFar);
            return;
        }

        currentLine().address = address;
    };

    const label = (symbolName: string): void =>
        symbolTable.persistentSymbol(symbolName, address);

    const lineAddress: PipelineProcess = () => {
        currentLine().address = address;
    };

    const reset: PipelineReset = () => {
        address = 0;
    };

    const lineLabel: PipelineProcess = () => {
        if (currentLine().label) {
            label(currentLine().label);
        }
    };

    const addressStep = (steps: number) => {
        const failed = setAddress(address + steps);
        if (failed) {
            addFailure(currentLine().failures, failed);
        }
    };

    return {
        "absoluteAddress": absoluteAddress,
        "relativeAddress": relativeAddress,
        "address": () => address,
        "origin": origin,
        "label": label,
        "addressStep": addressStep,
        "lineAddress": lineAddress,
        "lineLabel": lineLabel,
        "reset": reset
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
