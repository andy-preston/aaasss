import type { Directive } from "../directives/data-types.ts";
import {
    box, failure, isFailureOrBox, type Box, type Failure
} from "../failure/failure-or-box.ts";
import { returnIfExpression } from "./magic.ts";

type SimpleFunction = (n: number) => number;

type NumericGetter = () => number;

type ArrayParameter = Array<number> | string;

type ContextFields = SimpleFunction | Directive | number;

const trailingSemicolons = /;*$/;

export const anEmptyContext = () => {

    const context: Record<string, ContextFields> = {};

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

    const value = (jsSource: string): Box<string> | Failure => {
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

    const directive = (name: string, directive: Directive) => {
        Object.defineProperty(context, name, {
            "configurable": false,
            "enumerable": true,
            "value": directive,
            "writable": false
        });
    };

    const coupledProperty = (name: string, getter: NumericGetter) => {
        Object.defineProperty(context, name, {
            "configurable": false,
            "enumerable": true,
            "get": getter
        });
    };

    const property = (name: string, value: number): Box<number> | Failure => {
        if (Object.hasOwn(context, name)) {
            if (context[name] != value) {
                return failure(
                    undefined, "context_redefined", `${context[name]!}`
                );
            }
        } else {
            Object.defineProperty(context, name, {
                "configurable": false,
                "enumerable": true,
                "value": value,
                "writable": false
            });
        }
        return box(value);
    };

    return {
        "value": value,
        "property": property,
        "directive": directive,
        "coupledProperty": coupledProperty
    };
};

export type Context = ReturnType<typeof anEmptyContext>;
