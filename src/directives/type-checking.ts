import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";

export const stringParameter = (value: unknown): Box<string> | Failure => {
    const asString = `${value}`;
    return typeof value == "string"
        ? box(asString) : failure(undefined, "type_string", [asString]);
};

export const parameterList = (
    parameters: unknown,
    failureName: "type_strings" | "type_macroParams"
): Box<string> | Failure => {
    if (parameters == undefined) {
        return box("undefined");
    }

    if (!Array.isArray(parameters)) {
        return failure(undefined, failureName, [typeof parameters])
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
        ? failure(undefined, failureName, failed)
        : box("array");
};
