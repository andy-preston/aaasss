import type {
    DirectiveSymbol, JavaScriptFunction,
    FunctionUseDirective
} from "./data-types.ts";
import {
    stringDirective, functionDefineDirective, functionUseDirective
} from "./parameters.ts";

export const directiveFunction = (
    symbolName: string, directive: DirectiveSymbol
): JavaScriptFunction => {
    if (directive.type == "stringDirective") {
        return stringDirective(directive);
    }
    if (directive.type == "functionDefineDirective") {
        return functionDefineDirective(directive);
    }
    return functionUseDirective(symbolName, directive as FunctionUseDirective);
};
