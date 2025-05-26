import type { BaggedDirective } from "./bags.ts";
import type { JavaScriptFunction } from "./data-types.ts";
import {
    voidDirective, stringDirective, numberDirective, booleanDirective,
    valueDirective, dataDirective, functionDefineDirective, functionUseDirective
} from "./directives.ts";

export const directiveFunction = (
    symbolName: string, directive: BaggedDirective
): JavaScriptFunction => {
    switch (directive.type) {
        case "voidDirective": return voidDirective(directive);
        case "stringDirective": return stringDirective(directive);
        case "numberDirective": return numberDirective(directive);
        case "booleanDirective": return booleanDirective(directive);
        case "valueDirective": return valueDirective(directive);
        case "dataDirective": return dataDirective(directive);
        case "functionDefineDirective": return functionDefineDirective(directive);
        case "functionUseDirective": return functionUseDirective(symbolName, directive);
    }
};
