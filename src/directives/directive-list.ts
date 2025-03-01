import type { Directive } from "./data-types.ts";
import { javascriptDirectives } from "./runners.ts";

export const directiveList = () => {
    const list: Map<string, Directive> = new Map([]);

    const includes = (symbolName: string, directive: Directive) => {
        list.set(symbolName, directive);
    };

    const has = (symbolName: string) => list.has(symbolName);

    const use = (symbolName: string) => {
        const directive = list.get(symbolName)!;
        return javascriptDirectives[directive.parametersType];
    };

    return {
        "includes": includes,
        "has": has,
        "use": use,
    }
};

export type DirectiveList = ReturnType<typeof directiveList>;
