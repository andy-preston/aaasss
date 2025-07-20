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
    return result === true ? "1"
        : result === false ? "0"
        : typeof result == "number" ? `${result}`
        : typeof result == "string" ? result
        : "";
};

export type JsExpression = ReturnType<typeof jSExpression>;
