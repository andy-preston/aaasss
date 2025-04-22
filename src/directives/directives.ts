import type { BagOrFailures, Failure } from "../failure/bags.ts";
import type {
    VoidDirective, StringDirective, NumberDirective, ValueDirective,
    FunctionDefineDirective, FunctionUseDirective, DataDirective
} from "./bags.ts";
import type { JavaScriptFunction } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";

const arrayOfStrings = (them: unknown[]) => them.map(element => `${element}`);

const parameterTypes = (
    givenParameters: unknown[],
    requiredTypes: Array<"string" | "number">,
    length: number | undefined
): BagOrFailures => {
    const requiredIncludes = (actualType: string) =>
        (requiredTypes as Array<string>).includes(actualType);

    const failures: Array<Failure> = [];

    if (length != undefined && length != givenParameters.length) {
        failures.push(assertionFailure(
            "parameter_count", `${length}`, `${givenParameters.length}`
        ));
    }

    givenParameters.forEach((parameter, index) => {
        if (length != undefined && index >= length) {
            return;
        }
        const typeOf = Array.isArray(parameter) ? "array" : typeof parameter;
        if (!requiredIncludes(typeOf)) {
            const failure = assertionFailure(
                "type_failure", requiredTypes.join(", "), typeOf
            );
            failure.location = { "parameter": index };
            failures.push(failure);
        }
    });

    return failures.length == 0 ? emptyBag() : bagOfFailures(failures);
};

const numericParameter = (given: unknown, index: number) => {
    const numeric = validNumeric(given, undefined);
    if (numeric.type == "failures") {
        numeric.it.forEach((failure) => {
            failure.location = { "parameter": index };
        });
    }
    return numeric;
}

export const voidDirective = (
    directive: VoidDirective
): JavaScriptFunction => (...parameters: unknown[]) =>
    parameters.length != 0 ? bagOfFailures([assertionFailure(
        "parameter_count", "0", `${parameters.length}`
    )]) : directive.it();

export const stringDirective = (
    directive: StringDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string"], 1);
    return check.type == "failures"
        ? check
        : directive.it(arrayOfStrings(parameters)[0]!);
};

export const numberDirective = (
    directive: NumberDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const failures: Array<Failure> = [];
    if (parameters.length != 1) {
        failures.push(assertionFailure(
            "parameter_count", "1", `${parameters.length}`
        ));
    }

    const numeric = numericParameter(parameters[0], 0);
    if (numeric.type == "failures") {
        numeric.it.forEach((failure) => {
            failures.push(failure);
        });
    }

    return failures.length > 0
        ? bagOfFailures(failures)
        : directive.it(numeric.it as number);
};

export const valueDirective = (
    directive: ValueDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const failures: Array<Failure> = [];
    if (parameters.length != 2) {
        failures.push(assertionFailure(
            "parameter_count", "2", `${parameters.length}`
        ));
    }

    const typeOfFirst = typeof parameters[0];
    if (typeOfFirst != "string") {
        const failure = assertionFailure("type_failure", "string", typeOfFirst);
        failure.location = { "parameter": 0 };
        failures.push(failure);
    }

    const secondParameter = numericParameter(parameters[1], 1);
    if (secondParameter.type == "failures") {
        secondParameter.it.forEach((failure) => {
            failures.push(failure);
        });
    }

    return failures.length > 0
        ? bagOfFailures(failures)
        : directive.it(parameters[0] as string, secondParameter.it as number);
};

export const dataDirective = (
    directive: DataDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(parameters as Array<number | string>);
};

export const functionDefineDirective = (
    directive: FunctionDefineDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length == 0) {
        return bagOfFailures([boringFailure("parameter_firstName")]);
    }
    const check = parameterTypes(parameters, ["string"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(
            parameters[0] as string, arrayOfStrings(parameters.slice(1))
        );
};

export const functionUseDirective = (
    symbolName: string, directive: FunctionUseDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(symbolName, arrayOfStrings(parameters));
};
