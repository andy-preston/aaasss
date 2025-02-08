import type { Pass } from "../assembler/pass.ts";
import type { Directive } from "../directives/directive.ts";
import { emptyBox } from "../failure/failure-or-box.ts";
import type { Context } from "../javascript/context.ts";
import { MacroInvocation } from "../macros/playback.ts";
import { usageCount } from "./usage-count.ts";

type UserFunction = MacroInvocation;

export const symbolTable = (context: Context, pass: Pass) => {
    const usage = usageCount(pass);

    const directive = (symbol: string, directive: Directive) => {
        Object.defineProperty(context, symbol, {
            "configurable": false,
            "enumerable": true,
            "value": directive,
            "writable": false
        });
        usage.directive(symbol);
    };

    const countable = (symbol: string, value: number | UserFunction) => {
        const inUse = usage.add(symbol);
        if (inUse.which == "failure") {
            return inUse;
        }
        Object.defineProperty(context, symbol, {
            "configurable": pass.ignoreErrors(),
            "enumerable": true,
            "get": () => {
                usage.count(symbol);
                return value;
            }
        });
        return emptyBox();
    };

    const internalSymbol = (symbol: string, value: number) =>
        countable(symbol, value);

    const userSymbol = (symbol: string, value: number | UserFunction) => {
        const result = countable(symbol, value);
        if (result.which != "failure") {
            usage.add(symbol);
        }
        return result;
    };

    const userFunction = (symbol: string, value: UserFunction) =>
        userSymbol(symbol, value);

    // This is the directive FOR defining symbols
    // not an imperatively named function TO define directives.
    const defineDirective: Directive = (symbol: string, value: number) =>
        userSymbol(symbol, value);

    const value = (symbol: string) => {
        const actual = context[symbol];
        return ["number", "string"].includes(typeof actual)
            ? actual
            : null;
    };

    return {
        "directive": directive,
        "internalSymbol": internalSymbol,
        "userFunction": userFunction,
        "defineDirective": defineDirective,
        "count": usage.count,
        "currentCount": usage.current,
        "value": value,
        "empty": usage.empty,
        "list": usage.list
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
