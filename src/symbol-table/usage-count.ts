import type { Pass } from "../assembler/pass.ts";

export const usageCount = (pass: Pass) => {
    type SymbolMap = Map<string, number>;

    const symbols: Array<SymbolMap> = [new Map([]), new Map([])];

    const mapByPass = () => symbols[pass.ignoreErrors() ? 0 : 1]!;

    const add = (symbol: string) => {
        const map = mapByPass();
        if (!map.has(symbol)) {
            map.set(symbol, 0);
        }
    };

    const count = (symbol: string) => {
        const map = mapByPass();
        const newCount = map.has(symbol)
            ? map.get(symbol)! + 1
            : 1;
        map.set(symbol, newCount);
    };

    const isUsed = (symbol: string) => pass.ignoreErrors()
        ? true
        : symbols[0]!.has(symbol) && symbols[0]!.get(symbol)! > 0;

    const empty = () => mapByPass().size == 0;

    const list = () => mapByPass().entries();

    return {
        "add": add,
        "count": count,
        "isUsed": isUsed,
        "empty": empty,
        "list": list
    };
};

export type UsageCount = ReturnType<typeof usageCount>;
