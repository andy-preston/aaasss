import type { CurrentLine } from "../line/current-line.ts";

import { assertionFailure, boringFailure } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";

type ParameterType = "boolean" | "number" | "string";
type ParameterTypes = Array<ParameterType>;

const typeOf = (it: unknown) => Array.isArray(it) ? "array" : typeof it;

export const directiveParameters = (currentLine: CurrentLine) => {
    const failed = (expected: string, actual: string, index: number) => {
        const failure = assertionFailure("value_type", expected, actual);
        failure.location = {"parameter": index + 1};
        currentLine.failure(failure);
    };

    const numeric = (given: unknown, index: number) => {
        const numeric = validNumeric(given, undefined);
        if (numeric.type == "failures") {
            numeric.it.forEach((failure) => {
                failure.location = { "parameter": index };
                currentLine.failure(failure);
            });
            return 0;
        }
        return numeric.it;
    };

    const firstName = (actual: Array<unknown>) => {
        if (actual.length < 1 || typeOf(actual[0]) != "string") {
            currentLine.failure(boringFailure("parameter_firstName"));
        }
        return `${actual[0]}`;
    };

    const fixed = (
        expected: ParameterTypes, actual: Array<unknown>, indexOffset: number
    ) => {
        if (expected.length != actual.length) {
            currentLine.failure(assertionFailure(
                "parameter_count", `${expected.length}`, `${actual.length}`
            ));
        }
        return expected.map((expected, index) => {
            const parameter = actual[index];
            if (expected == "number") {
                return numeric(parameter, index + indexOffset);
            }
            if (expected == "boolean") {
                return parameter ? true : false;
            }
            if (expected != typeOf(parameter)) {
                failed(expected, typeOf(parameter), index + indexOffset);
            }
            return parameter;
        });
    };

    const variable = (
        expected: ParameterTypes, actual: Array<unknown>, indexOffset: number
    ) => actual.map((actual, index) => {
        if (!(expected as Array<string>).includes(typeOf(actual))) {
            failed(expected.join(", "), typeOf(actual), index + indexOffset);
        }
        return expected.length == 1 && expected[0] == "number"
            ? numeric(actual, index) : actual;
    });

    return {"firstName": firstName, "fixed": fixed, "variable": variable};
};
