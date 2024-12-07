import type { Line } from "../coupling/line.ts";
import type { Failures } from "../coupling/value-failure.ts";
import { codeLine, type CodeLine } from "../object-code/code-line.ts";
import { addressedLine, pokedLine } from "../program-memory/line-types.ts";
import type { TokenisedLine, TokenisedProperties } from "../tokenise/tokenised-line.ts";


// ExpandedLine doesn't that much sense, it's short for "line with expanded
// macro" or something like that... but it's better than the nonsensical
// "MacroedLine" that I started with.

export type ExpandedProperties = TokenisedProperties | "macroName";

export type ExpandedLine = Readonly<Pick<Line, ExpandedProperties>>;

export const expandedLine = (
    line: TokenisedLine,
    macroName: string,
    failures: Failures
): ExpandedLine => {
    (line as Line).macroName = macroName;
    line.addFailures(failures);
    return line as ExpandedLine;
};

export const shortCutCodeLine = (line: ExpandedLine): CodeLine => {
    const addressed = addressedLine(line, 0, []);
    const poked = pokedLine(addressed, [], []);
    return codeLine(poked, [], [], []);
};
