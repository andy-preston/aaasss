import { box, failure, type Box, type Failure } from "./value-failure.ts";

export const stringParameter = (value: unknown): Box<string> | Failure => {
    const asString = `${value}`;
    return typeof value == "string"
        ? box(asString) : failure(undefined, "type.string", asString);
};

export const positiveParameter = (value: unknown): Box<number> | Failure => {
    const asString = `${value}`;
    return typeof value == "number"
        && parseInt(`${value}`) == value
        && value >= 0
        ? box(value as number) : failure(undefined, "type.positive", asString);
};
