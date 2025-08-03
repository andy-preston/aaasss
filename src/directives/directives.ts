import type { CurrentLine } from "../assembler/line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { DirectiveFunction, ParameterTypes } from "./data-types.ts";
import type { DirectiveList } from "./directive-list.ts";

import { typeOf } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure } from "../failure/bags.ts";
import { badLabel } from "../tokens/label.ts";

type Validator = (actual: unknown, location: number) => boolean;

export const directives = (
    directiveList: DirectiveList,
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    const countGood = (required: number, actual: number) => {
        const good = actual == required;
        if (!good) {
            addFailure(currentLine().failures, assertionFailure(
                "parameter_count", `${required}`, `${actual}`
            ));
        }
        return good;
    };

    const simpleType = (
        requiredType: string, actual: unknown, location: number
    ) => {
        const actualType = typeOf(actual);
        if (requiredType != actualType) {
            const failure = assertionFailure(
                "parameter_type", requiredType, actualType
            );
            failure.location = {"parameter": location};
            addFailure(currentLine().failures, failure);
            return false;
        }
        return true;
    };

    const validLabel: Validator = (actual: unknown, location: number) => {
        if (!simpleType("string", actual, location)) {
            return false;
        }
        const bad = badLabel(actual as string);
        if (bad != undefined) {
            bad.location = {"parameter": location};
            addFailure(currentLine().failures, bad);
            return false;
        }
        return true;
    };

    const validSignedByte: Validator = (actual: unknown, location: number) => {
        if (!simpleType("number", actual, location)) {
            return false;
        }
        const good = actual as number >= -128 && actual as number <= 127;
        if (!good) {
            const failure = assertionFailure(
                "parameter_value", "(signed byte) (-128)-127", `${actual}`
            );
            failure.location = {"parameter": location};
            addFailure(currentLine().failures, failure);
        }
        return good;
    };

    const validWord: Validator = (actual: unknown, location: number) => {
        if (!simpleType("number", actual, location)) {
            return false;
        }
        const good = actual as number >= 0 && actual as number <= 0xffff;
        if (!good) {
            const failure = assertionFailure(
                "parameter_value", "(word) 0-FFFF", `${actual}`
            );
            failure.location = {"parameter": location};
            addFailure(currentLine().failures, failure);
        }
        return good;
    };

    const specialTypes: Record<string, Validator> = {
        "label": validLabel,
        "signedByte": validSignedByte,
        "word": validWord,
    };

    const typesGood = (
        required: Array<string>, actual: Array<unknown>
    ) => required.reduce(
        (goodSoFar, requiredType, index) => {
            const special = specialTypes[requiredType];
            const good = special == undefined
                ? simpleType(requiredType, actual[index], index + 1)
                : special(actual[index], index + 1);
            return good ? goodSoFar : false;
        },
        true
    );

    const typeChecked = (
        directiveFunction: DirectiveFunction, parameterTypes: ParameterTypes
    ): DirectiveFunction => (...parameters) => {
        if (!countGood(parameterTypes.length, parameters.length)) {
            return undefined;
        }
        if (!typesGood(parameterTypes, parameters)) {
            return undefined;
        }
        return directiveFunction(...parameters)
    };

    Object.entries(directiveList).forEach(directive => {
        const [name, [directiveFunction, parameterTypes]] = directive;
        symbolTable.builtInSymbol(
            name,
            parameterTypes == undefined ? directiveFunction
                : typeChecked(directiveFunction, parameterTypes)
        );
    });
};
