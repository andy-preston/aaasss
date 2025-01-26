export const usageCount = () => {

    const symbols: Map<string, number> = new Map([]);

    const reset = () => {
        symbols.clear();
    };

    const count = (symbol: string) => {
        const newCount = symbols.has(symbol)
            ? symbols.get(symbol)! + 1
            : 1;
        symbols.set(symbol, newCount);
    };

    const empty = () => symbols.size == 0;

    const list = () => symbols.entries();

    return {
        "reset": reset,
        "count": count,
        "empty": empty,
        "list": list
    };
};

export type UsageCount = ReturnType<typeof usageCount>;
