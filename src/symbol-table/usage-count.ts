import type { Pass } from "../assembler/pass.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";

export const usageCount = (pass: Pass) => {
    type SymbolMap = Map<string, number>;

    const symbols: Array<SymbolMap> = [new Map([]), new Map([])];
    const directives: Array<string> = [];

    const directive = (symbol: string) => {
        directives.push(symbol);
    };

    const mapByPass = () => symbols[pass.ignoreErrors() ? 0 : 1]!;

    const isUsed = (symbol: string) =>
        pass.ignoreErrors()
            ? emptyBox()
            : symbols[0]!.has(symbol) && symbols[0]!.get(symbol)! > 0
            ? emptyBox()
            : failure(undefined, "symbol_notUsed", undefined);

    const add = (symbol: string) => {
        const map = mapByPass();
        if (directives.includes(symbol) || map.has(symbol)) {
            return failure(undefined, "symbol_redefined", undefined);
        }
        map.set(symbol, 0);
        return isUsed(symbol);
    };

    const count = (symbol: string) => {
        const map = mapByPass();
        const newCount = map.has(symbol)
            ? map.get(symbol)! + 1
            : 1;
        map.set(symbol, newCount);
    };

    const empty = () => mapByPass().size == 0;

    const list = () => mapByPass().entries();

    return {
        "directive": directive,
        "add": add,
        "count": count,
        "empty": empty,
        "list": list
    };
};

export type UsageCount = ReturnType<typeof usageCount>;
