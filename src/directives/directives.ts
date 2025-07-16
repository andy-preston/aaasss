import type { CurrentLine } from "../line/current-line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { DirectiveFunction, ParameterTypes } from "./data-types.ts";
import type { DirectiveList } from "./directive-list.ts";

import { typeOf } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure } from "../failure/bags.ts";

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

    const typesGood = (
        required: Array<string>, actual: Array<unknown>
    ) => required.reduce(
        (goodSoFar, requiredType, index) => {
            const actualType = typeOf(actual[index]);
            if (requiredType != actualType) {
                const failure = assertionFailure(
                    "parameter_type", requiredType, actualType
                );
                failure.location = {"parameter": index + 1};
                addFailure(currentLine().failures, failure);
                return false;
            }
            return goodSoFar;
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
