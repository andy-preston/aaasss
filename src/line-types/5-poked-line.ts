import type { Failures } from "../coupling/value-failure.ts";
import { Code } from "../object-code/data-types.ts";
import type { Line } from "./0-line.ts";
import type { AddressedLine, AddressedProperties } from "../program-memory/addressed-line.ts";

export type PokedProperties = AddressedProperties | "code";

export type PokedLine = Readonly<Pick<Line, PokedProperties>>;

export const pokedLine = (
    line: AddressedLine,
    poked: Array<Code>,
    failures: Failures
): PokedLine => {
    (line as Line).code = poked;
    line.addFailures(failures);
    return line as PokedLine;
};
