import type { DirectiveSymbol, FunctionUseDirective, JavaScriptFunction } from "./data-types.ts";
import { functionDefineDirective, functionUseDirective } from "./parameters.ts";

export const directiveFunction = (
    symbolName: string, directive: DirectiveSymbol
): JavaScriptFunction => {
    if (directive.type == "functionDefineDirective") {
        return functionDefineDirective(directive);
    }
    //if (directive.type == "functionUseDirective") {
        return functionUseDirective(symbolName, directive as FunctionUseDirective);
    //}
};
