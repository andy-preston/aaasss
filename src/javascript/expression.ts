import { isDiscrete } from "../assembler/data-types.ts";
import { JsFunction } from "./function.ts";

const trailingSemicolons = /;*$/;

export const jSExpression = (
    jsFunction: JsFunction
) => (
    jsSource: string
): string => {
    const clean = jsSource
        .replaceAll("\n", "\\\n")
        .replaceAll('"', '\\\"')
        .trim()
        .replace(trailingSemicolons, "")
        .trim();
    const result = clean == ""
        ? ""
        : jsFunction(`return eval("${clean}");`);
    return isDiscrete(result)
        ? `${result}`
        : "";
};

export type JsExpression = ReturnType<typeof jSExpression>;
