import type { DirectiveSymbol } from "./data-types.ts";

export const directiveList = () => {
    const list: Map<string, DirectiveSymbol> = new Map();

    const includes = (symbolName: string, directive: DirectiveSymbol) => {
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
