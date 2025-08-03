import type { Failures } from "../failure/failures.ts";

import { valueTypeFailure } from "../failure/failures.ts";

const textEncoder = new TextEncoder();

export const pokedBytes = (
    data: Array<unknown>, failures: Failures
): Array<number> => data.flatMap((item, index) => {
    if (typeof item == "string") {
        return Array.from(textEncoder.encode(item));
    }

    if (typeof item == "number" && item >= 0 && item <= 0xff) {
        return item;
    }

    const failure = valueTypeFailure("string, byte", item);
    failure.location = {"parameter": index + 1};
    failures(failure);
    return 0;
});
