import { box, type Box } from "../coupling/value-failure.ts";
import { failure, type Failure } from "../failure/failures.ts";
import type { SymbolicOperand } from "../operands/data-types.ts";
import { returnIfExpression } from "./magic.ts";

type SimpleFunction = (n: number) => number;

type NumericGetter = () => number;

type ArrayParameter = Array<number> | string;

// deno-lint-ignore no-explicit-any
export type Directive = (...args: any[]) => Box<string> | Failure;

type ContextFields = SimpleFunction | Directive | number;

export const anEmptyContext = () => {
    const context: Record<string, ContextFields> = {
        "low": (n: number) => n & 0xff,
        "high": (n: number) => (n >> 8) & 0xff
    };

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
        const trimmed = jsSource.trim().replace(/;*$/, "").trim();
        if (trimmed == "") {
            return box("");
        }
        const result = functionCall(
            `with (this) { ${returnIfExpression(trimmed)}; }`
        );
        return result == undefined
            ? box("") : Object.hasOwn(result, "which")
            ? result as Box<string> | Failure : box(`${result}`.trim());
    };

    const operand = (operand: SymbolicOperand): Box<number> | Failure => {
        const fromContext = value(operand);
        return fromContext.which == "failure"
            ? fromContext
            : box(fromContext.value == "" ? 0 : parseInt(fromContext.value));
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
        "operand": operand,
        "value": value,
        "property": property,
        "directive": directive,
        "coupledProperty": coupledProperty
    };
};

export type Context = ReturnType<typeof anEmptyContext>;
