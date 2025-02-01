import { box, failure, isFailureOrBox, type Box, type Failure } from "../failure/failure-or-box.ts";
import { Context } from "./context.ts";
import { returnIfExpression } from "./magic.ts";

const trailingSemicolons = /;*$/;

export const jSExpression = (context: Context) => {
    const functionCall = (functionBody: string) => {
        try {
            return new Function(functionBody).call(context);
        } catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "js_error", error);
            }
            throw error;
        }
    };

    return (jsSource: string): Box<string> | Failure => {
        const trimmed = jsSource.trim().replace(trailingSemicolons, "").trim();
        if (trimmed == "") {
            return box("");
        }
        const result = functionCall(
            `with (this) { ${returnIfExpression(trimmed)}; }`
        );
        return result == undefined
            ? box("")
            : isFailureOrBox(result)
            ? result as Box<string> | Failure
            : box(`${result}`.trim());
    };
};

export type JsExpression = ReturnType<typeof jSExpression>;
