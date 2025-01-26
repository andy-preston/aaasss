export const usageCount = () => {

    const symbols: Map<string, number> = new Map([]);

    const reset = () => {
        symbols.clear();
    };

    // * Internally defined symbols don't get counted until their first use -
    //   making them invisible to the zero-count check.
    // * User Defined symbols should get a count as soon as they're defined -
    //   so that they ARE subject to the zero-count check.
    const add = (symbol: string) => {
        symbols.set(symbol, 0);
    }

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
        "add": add,
        "count": count,
        "empty": empty,
        "list": list
    };
};

export type UsageCount = ReturnType<typeof usageCount>;
