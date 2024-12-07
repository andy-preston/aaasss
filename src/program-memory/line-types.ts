import type { Failures } from "../coupling/value-failure.ts";
import type { Line } from "../coupling/line.ts";
import type { ExpandedLine, ExpandedProperties } from "../macro/line-types.ts";
import type { Code } from "../object-code/data-types.ts";

type AddressedProperties = ExpandedProperties | "address";

export type AddressedLine = Readonly<Pick<Line, AddressedProperties>>;

export const addressedLine = (
    line: ExpandedLine,
    address: number,
    failures: Failures
): AddressedLine => {
    (line as Line).address = address;
    line.addFailures(failures);
    return line as AddressedLine;
};

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
