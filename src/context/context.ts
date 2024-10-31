import { failure, type Failure } from "../failure.ts";
import type { SymbolicOperand } from "../source-files/line.ts";
import type { Pass } from "../state/pass.ts";
import { returnIfExpression } from "./magic.ts";

type SimpleFunction = (n: number) => number;
type StringDirective = (s: string) => void;
type NumberDirective = (n: number) => void;
type ArrayDirective = (a: Array<number> | string) => void;
type Directive = StringDirective | NumberDirective | ArrayDirective;
type NumericGetter = () => number;
type ContextFields = SimpleFunction | Directive | number;

export const contextValue = (value: string) => ({
    "which": "value" as const,
    "value": value
});

export type ContextValue = Readonly<ReturnType<typeof contextValue>>;

export const newContext = (pass: Pass) => {
    const context: Record<string, ContextFields> = {
        "low": (n: number) => n & 0xff,
        "high": (n: number) => (n >> 8) & 0xff
    };

    const value = (jsSource: string): ContextValue | Failure => {
        const trimmed = jsSource.trim().replace(/;*$/, "").trim();
        if (trimmed == "") {
            return contextValue("");
        }
        const functionBody = `with (this) { ${returnIfExpression(trimmed)}; }`;
        try {
            const result = new Function(functionBody).call(context);
            return contextValue(result == undefined ? "" : `${result}`.trim());
        } catch (error) {
            if (error instanceof Error) {
                return failure(undefined, "js", error);
            }
            throw error;
        }
    };

    const operand = (operand: SymbolicOperand): ContextValue | Failure => {
        const fromContext = value(operand);
        return fromContext.which == "failure" && pass.ignoreErrors()
            ? contextValue("0")
            : fromContext;
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
