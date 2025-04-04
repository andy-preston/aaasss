import { Failure } from "../failure/bags.ts";
import { LineWithObjectCode } from "../object-code/line-types.ts";

export const mockFailureMessages = (
    failure: Failure, _line: LineWithObjectCode
) => ([ failure.kind ] as Array<string>).concat(
    Object.entries(failure).filter(
        ([label, value]) => label != "kind" && value != undefined
    ).flatMap(([label, value]) =>
        Array.isArray(value)
        ? value.map(
            (item, index) => `${label}[${index}]: ${item}`
        )
        : value instanceof Object
        ? Object.entries(value).filter(
            ([_field, value]) =>  value != undefined
        ).map(
            ([field, value]) => `${label}.${field}: ${value}`
        )
        : `${label}: ${value}`
    )
);
