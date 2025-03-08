import type { BaggedDirective } from "./bags.ts";

export const directiveList = () => {
    const list: Map<string, BaggedDirective> = new Map();

    const includes = (symbolName: string, directive: BaggedDirective) => {
        list.set(symbolName, directive);
    };

    const has = (symbolName: string) => list.has(symbolName);

    const use = (symbolName: string) => list.get(symbolName)!;

    return {
        "includes": includes,
        "has": has,
        "use": use,
    }
};

export type DirectiveList = ReturnType<typeof directiveList>;
