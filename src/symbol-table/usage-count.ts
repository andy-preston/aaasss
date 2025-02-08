import type { Pass } from "../assembler/pass.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";

export const usageCount = (pass: Pass) => {
    type SymbolMap = Map<string, number>;

    const symbols: Array<SymbolMap> = [new Map([]), new Map([])];

    // We only keep a list of directives to stop them adding symbols that
    // clash with them.
    const directives: Array<string> = [];

    const directive = (symbol: string) => { directives.push(symbol); };

    const map = () => symbols[pass.ignoreErrors() ? 0 : 1]!;

    const isUsed = (symbol: string) =>
        pass.ignoreErrors()
            ? emptyBox()
            : symbols[0]!.has(symbol) && symbols[0]!.get(symbol)! > 0
            ? emptyBox()
            : failure(undefined, "symbol_notUsed", undefined);

    const add = (symbol: string) => {
        if (directives.includes(symbol) || map().has(symbol)) {
            return failure(undefined, "symbol_redefined", undefined);
        }
        map().set(symbol, 0);
        return isUsed(symbol);
    };

    const current = (symbol: string) => {
        return map().has(symbol) ? map().get(symbol)! : 0;
    };

    const count = (symbol: string) => {
        map().set(symbol, current(symbol) + 1);
    };

    const empty = () => map().size == 0;

    const list = () => map().keys();

    return {
        "directive": directive,
        "add": add,
        "count": count,
        "current": current,
        "empty": empty,
        "list": list
    };
};

export type UsageCount = ReturnType<typeof usageCount>;
