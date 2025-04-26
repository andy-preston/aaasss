export const counting = () => {
    const counts: Map<string, number> = new Map();

    const reset = () => {
        counts.clear();
    };

    const set = (symbolName: string) => {
        counts.set(symbolName, 0);
    }

    const increment = (
        symbolName: string, exposure: "revealIfHidden" | "keepHidden"
    ) => {
        const count = counts.get(symbolName);
        if (count != undefined) {
            counts.set(symbolName, count + 1);
        }
        else if (exposure == "revealIfHidden") {
            counts.set(symbolName, 1);
        }
    };

    const count = (symbolName: string) => {
        const result = counts.get(symbolName);
        return result == undefined ? 0 : result;
    };

    const list = () => [...counts.entries()];

    return {
        "reset": reset,
        "set": set,
        "increment": increment,
        "count": count,
        "list": list
    };
};
