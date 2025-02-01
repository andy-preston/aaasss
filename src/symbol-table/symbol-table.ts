import type { Pass } from "../assembler/pass.ts";
import type { Directive } from "../directives/directive.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { Context } from "../javascript/context.ts";
import { usageCount } from "./usage-count.ts";

export const symbolTable = (context: Context, pass: Pass) => {
    const usage = usageCount(pass);

    const internalSymbol = (name: string, value: number) => {
        if (Object.hasOwn(context, name)) {
            return context[name] == value
                ? emptyBox()
                : failure(undefined, "context_redefined", `${context[name]!}`);
        }
        Object.defineProperty(context, name, {
            "configurable": false,
            "enumerable": true,
            "get": () => {
                usage.count(name);
                return value;
            }
        });
        return emptyBox();
    };

    const userSymbol = (name: string, value: number) => {
        if (!usage.isUsed(name)) {
            return failure(undefined, "symbol_notUsed", undefined);
        }
        const result = internalSymbol(name, value);
        if (result.which != "failure") {
            usage.add(name);
        }
        return result;
    };

    const defineDirective: Directive = (name: string, value: number) =>
        userSymbol(name, value);

    return {
        "internalSymbol": internalSymbol,
        "userSymbol": userSymbol,
        "defineDirective": defineDirective,
        "count": usage.count,
        "empty": usage.empty,
        "list": usage.list
    };
};

export type SymbolTable = ReturnType<typeof symbolTable>;
