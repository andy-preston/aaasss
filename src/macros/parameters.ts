import type { UncheckedParameters } from "../directives/data-types.ts";
import type { Failures } from "../failure/failures.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { typeOf } from "../assembler/data-types.ts";
import { assertionFailure } from "../failure/failures.ts";
import { discreteTypes, isDiscrete } from "../symbol-table/data-types.ts";

export type MacroParameters = Array<string>;

export const defineParameters = (
    uncheckedParameters: UncheckedParameters, failures: Failures
): boolean => {
    if (uncheckedParameters.length < 1) {
        failures(assertionFailure(
            "parameter_count", ">=1", `${uncheckedParameters.length}`
        ));
        return false;
    }

    return uncheckedParameters.reduce(
        (allGood, parameter, index) => {
            const actual = typeOf(parameter);
            if (actual != "string") {
                const failure = assertionFailure(
                    "parameter_type", "string", actual
                );
                failure.location = {"parameter": index + 1};
                failures(failure);
                return false;
            }
            return allGood;
        }, true
    );
};

export const nameAndParameters = (
    uncheckedParameters: UncheckedParameters
): [string, Array<string>] => {
    const stringParameters = uncheckedParameters as Array<string>;
    const newName = stringParameters.shift()!;
    return [newName, stringParameters];
}

export const useParameters = (
    parameterDefinitions: MacroParameters,
    uncheckedParameters: UncheckedParameters,
    failures: Failures,
    symbolTable: SymbolTable
) => {
    if (uncheckedParameters.length != parameterDefinitions.length) {
        failures(assertionFailure(
            "parameter_count",
            `${parameterDefinitions.length}`, `${uncheckedParameters.length}`
        ));
    }

    return parameterDefinitions.reduce(
        (allGood, parameterName, index) => {
            const actualParameter = uncheckedParameters[index];
            if (isDiscrete(actualParameter)) {
                symbolTable.persistentSymbol(parameterName, actualParameter);
                return allGood;
            }

            const failure = assertionFailure(
                "parameter_type",
                `${discreteTypes.join(", ")}: (${parameterName})`,
                `${typeOf(actualParameter)}: (${actualParameter})`
            );
            failure.location = {"parameter": index + 1};
            failures(failure);
            return false;
        }, true
    );
};
