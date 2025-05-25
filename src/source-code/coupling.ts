import type { StringDirective } from "../directives/bags.ts";
import type { FileStack } from "./file-stack.ts";

export const sourceCodeCoupling = (fileStack: FileStack) => {

    const includeDirective: StringDirective = {
        "type": "stringDirective", "it": fileStack.include
    };

    return {
        "includeDirective": includeDirective,
        "lines": fileStack.lines
    }
};
