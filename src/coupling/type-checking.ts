import { box, failure, type Box, type Failure } from "./value-failure.ts";

export const stringParameter = (value: unknown): Box<string> | Failure => {
    const asString = `${value}`;
    return typeof value == "string"
        ? box(asString) : failure(undefined, "type.string", asString);
};

export const positiveParameter = (value: unknown): Box<number> | Failure => {
    const asString = `${value}`;
    return typeof value == "number"
        && parseInt(`${value}`) == value
        && value >= 0
        ? box(value as number) : failure(undefined, "type.positive", asString);
};

export const parameterList = (
    parameters: unknown,
    failureName: "type.strings" | "type.params"
): Box<string> | Failure => {
    if (parameters == undefined) {
        return box("undefined");
    }

    if (!Array.isArray(parameters)) {
        return failure(undefined, failureName, typeof parameters)
    }

    const legalTypes = failureName == "type.strings"
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
