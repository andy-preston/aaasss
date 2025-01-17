import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import type { NumericTypeFailure } from "../failure/failures.ts";

export const stringParameter = (value: unknown): Box<string> | Failure => {
    const asString = `${value}`;
    return typeof value == "string"
        ? box(asString) : failure(undefined, "type_string", asString);
};

const minMax: Map<NumericTypeFailure, [number, number | undefined]> = new Map([
    ["type_positive", [0, undefined]],
    ["type_word", [0, 0xffff]],
    ["type_byte", [0, 0xff]]
]);

export const numericParameter = (
    value: unknown, typeFailure: NumericTypeFailure
): Box<number> | Failure => {
    const asString = `${value}`;
    const [min, max] = minMax.get(typeFailure)!;
    return typeof value == "number"
        && Number.parseInt(`${value}`) == value
        && value >= min
        && (max == undefined || value <= max)
        ? box(value as number)
        : failure(undefined, typeFailure, asString);
};

export const parameterList = (
    parameters: unknown,
    failureName: "type_strings" | "type_macroParams"
): Box<string> | Failure => {
    if (parameters == undefined) {
        return box("undefined");
    }

    if (!Array.isArray(parameters)) {
        return failure(undefined, failureName, typeof parameters)
    }

    const legalTypes = failureName == "type_strings"
        ? ["string"] : ["string", "number"];
    const failed: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (!legalTypes.includes(typeOf)) {
            failed.push(`${index}: ${typeOf}`);
        }
    }
    return failed.length > 0
        ? failure(undefined, failureName, failed.join(", "))
        : box("array");
};
