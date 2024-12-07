import type { Failures } from "../coupling/value-failure.ts";
import type { Line } from "./0-line.ts";
import type { TokenisedLine, TokenisedProperties } from "./3-tokenised-line.ts";

export type AddressedProperties = TokenisedProperties | "address";

export type AddressedLine = Readonly<Pick<Line, AddressedProperties>>;

export const addressedLine = (
    line: TokenisedLine,
    address: number,
    failures: Failures
): AddressedLine => {
    (line as Line).address = address;
    line.addFailures(failures);
    return line as AddressedLine;
};
