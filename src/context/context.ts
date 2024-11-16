import { box, failure, type Box, type Failure } from "../value-or-failure.ts";
import type { SymbolicOperand } from "../coupling/line.ts";
import type { Pass } from "../state/pass.ts";
import { returnIfExpression } from "./magic.ts";

type SimpleFunction = (n: number) => number;
type StringDirective = (s: string) => void;
type NumberDirective = (n: number) => void;
type ArrayDirective = (a: Array<number> | string) => void;
type Directive = StringDirective | NumberDirective | ArrayDirective;
type NumericGetter = () => number;
type ContextFields = SimpleFunction | Directive | number;

export const newContext = (pass: Pass) => {
    const context: Record<string, ContextFields> = {
        "low": (n: number) => n & 0xff,
        "high": (n: number) => (n >> 8) & 0xff
    };

    const functionCall = (functionBody: string) => {
        try {
            return new Function(functionBody).call(context);
        } catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "js.error", error);
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

    const operand = (
        operand: SymbolicOperand
    ): Box<number | undefined> | Failure => {
        const fromContext = value(operand);
        if (fromContext.which == "box") {
            return box(
                fromContext.value == ""
                    ? undefined
                    : parseInt(fromContext.value)
            );
        }
        return pass.ignoreErrors() ? box(undefined) : fromContext;
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

    const validProperty = (name: string, value: number) =>
        !Object.hasOwn(context, name) || context[name] == value;

    const property = (name: string, value: number): void => {
        if (Object.hasOwn(context, name) && context[name] == value) {
            return;
        }
        Object.defineProperty(context, name, {
            "configurable": false,
            "enumerable": true,
            "value": value,
            "writable": false
        });
    };

    return {
        "operand": operand,
        "value": value,
        "validProperty": validProperty,
        "property": property,
        "directive": directive,
        "coupledProperty": coupledProperty
    };
};

export type Context = ReturnType<typeof newContext>;
