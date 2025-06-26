import type { CurrentLine } from "../line/current-line.ts";

import { typeOf } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure, boringFailure, valueTypeFailure } from "../failure/bags.ts";

type ParameterType = "boolean" | "number" | "string";

type ParameterTypes = Array<ParameterType>;

export const directiveParameters = (currentLine: CurrentLine) => {

    const numeric = (given: unknown, index: number) => {

        if (!["number", "string"].includes(typeOf(given))) {
            const failure = valueTypeFailure("number | string", given);
            failure.location = {"parameter": index + 1};
            addFailure(currentLine().failures, failure);
            return 0;
        }

        const numeric = typeof given == "number" ? given : parseInt(`${given}`);
        if (`${numeric}` != `${given}`) {
            const failure = valueTypeFailure("numeric", given);
            failure.location = {"parameter": index + 1};
            addFailure(currentLine().failures, failure);
            return 0;
        }

        return numeric;
    };

    const firstName = (actual: Array<unknown>) => {
        if (actual.length < 1 || typeOf(actual[0]) != "string") {
            addFailure(currentLine().failures, boringFailure(
                "parameter_firstName"
            ));
        }
        return `${actual[0]}`;
    };

    const fixed = (
        expected: ParameterTypes, actual: Array<unknown>,
        parameterOffset: number
    ) => {
        if (expected.length != actual.length) {
            addFailure(currentLine().failures, assertionFailure(
                "parameter_count", `${expected.length}`, `${actual.length}`
            ));
        }
        return expected.map((expected, index) => {
            const parameter = actual[index];
            if (expected == "number") {
                return numeric(parameter, index + parameterOffset);
            }
            if (expected == "boolean") {
                return parameter ? true : false;
            }
            if (expected == typeOf(parameter)) {
                return parameter;
            }
            const failure = valueTypeFailure(expected, parameter);
            failure.location = {"parameter": index + 1};
            addFailure(currentLine().failures, failure);
            return undefined;
        });
    };

    const variable = (
        expected: ParameterTypes, actual: Array<unknown>,
        parameterOffset: number
    ) => actual.map((actual, index) => {
        if (!(expected as Array<string>).includes(typeOf(actual))) {
            const failure = valueTypeFailure(expected.join(", "), actual);
            failure.location = {"parameter": index + 1 + parameterOffset};
            addFailure(currentLine().failures, failure);
        }
        return expected.length == 1 && expected[0] == "number"
            ? numeric(actual, index) : actual;
    });

    return {"firstName": firstName, "fixed": fixed, "variable": variable};
};
