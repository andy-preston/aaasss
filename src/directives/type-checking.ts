import { box, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import { FailureKind } from "../failure/failures.ts";


type Expected = Extract<FailureKind, "type_strings" | "type_macroParams">;

const legalTypes: Record<Expected, Array<string>> = {
    "type_strings": ["string"],
    "type_macroParams": ["string", "number"],
};

type Thingy = "undefined" | "array";

export const parameterList = (
    parameters: unknown,
    expected: Expected
): Box<Thingy> | Failure => {
    if (parameters == undefined) {
        return box("undefined");
    }

    if (!Array.isArray(parameters)) {
        return failure(undefined, expected, [typeof parameters])
    }

    const failed: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (!legalTypes[expected].includes(typeOf)) {
            failed.push(`${index}: ${typeOf}`);
        }
    }
    return failed.length > 0
        ? failure(undefined, expected, failed)
        : box("array");
};
