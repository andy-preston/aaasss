import type { LineWithRawSource } from "../source-code/line-types.ts";

/* This is horrible, horrible, horrible!
   But I can't think of any other way to do it right now. */

declare const currentLine: LineWithRawSource;

export const currentFileName = () =>
    "currentLine" in globalThis ? currentLine.fileName : "";

export const currentLineNumber = () =>
    "currentLine" in globalThis ? currentLine.lineNumber : 0;

export const saveGlobalLineForDirectives = (line: LineWithRawSource) => {
    // deno-lint-ignore no-explicit-any
    (globalThis as any).currentLine = line;
};
