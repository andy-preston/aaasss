import type { BaggedDirective } from "./bags.ts";
import type { JavaScriptFunction } from "./data-types.ts";
import {
    voidDirective, stringDirective, numberDirective, valueDirective, dataDirective,
    functionDefineDirective, functionUseDirective
} from "./parameters.ts";

export const directiveFunction = (
    symbolName: string, directive: BaggedDirective
): JavaScriptFunction => {
    switch (directive.type) {
        case "voidDirective": return voidDirective(directive);
        case "stringDirective": return stringDirective(directive);
        case "numberDirective": return numberDirective(directive);
        case "valueDirective": return valueDirective(directive);
        case "dataDirective": return dataDirective(directive);
        case "functionDefineDirective": return functionDefineDirective(directive);
        case "functionUseDirective": return functionUseDirective(symbolName, directive);
    }
};
