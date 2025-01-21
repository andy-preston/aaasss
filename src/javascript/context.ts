import type { Directive } from "../directives/data-types.ts";
import {
    box, emptyBox, failure, isFailureOrBox, type Box, type Failure
} from "../failure/failure-or-box.ts";
import { SymbolTable } from "../listing/symbol-table.ts";
import { returnIfExpression } from "./magic.ts";

type SimpleFunction = (n: number) => number;

type NumericGetter = () => number;

type ArrayParameter = Array<number> | string;

type ContextFields = SimpleFunction | Directive | number;

const trailingSemicolons = /;*$/;

export const anEmptyContext = (symbolTable: SymbolTable) => {

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

    const defineInternal = (name: string, value: number) => {
        if (Object.hasOwn(context, name)) {
            return context[name] == value
                ? emptyBox()
                : failure(undefined, "context_redefined", `${context[name]!}`);
        }
        Object.defineProperty(context, name, {
            "configurable": false,
            "enumerable": true,
            "get": () => {
                symbolTable.count(name);
                return value;
            }
        });
        return emptyBox();
    };

    const define: Directive = (name: string, value: number) => {
        const result = defineInternal(name, value);
        if (result.which != "failure") {
            symbolTable.count(name);
        }
        return result;
    };

    return {
        "value": value,
        "define": define,
        "defineInternal": defineInternal,
        "directive": directive
    };
};

export type Context = ReturnType<typeof anEmptyContext>;
