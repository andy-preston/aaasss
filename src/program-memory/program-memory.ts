import type { ImmutableLine } from "../assembler/line.ts";
import type { NumberDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { StringOrFailures } from "../failure/bags.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { emptyBag, numberBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import { lineWithAddress } from "./line-types.ts";

const bytesToWords = (byteCount: number): number => byteCount / 2;

export const programMemory = (symbolTable: SymbolTable) => {
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

    const addressStep = (line: LineWithObjectCode) => {
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

    const assemblyPipeline = function* (
        lines: IterableIterator<ImmutableLine>
    ) {
        for (const line of lines) {
            yield addressStep(line);
            if (line.lastLine) {
                address = 0;
            }
        }
    };

    return {
        "address": () => address,
        "originDirective": originDirective,
        "assemblyPipeline": assemblyPipeline
    };
};

export type ProgramMemory = ReturnType<typeof programMemory>;
