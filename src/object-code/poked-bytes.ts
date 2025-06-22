import type { Failure } from "../failure/bags.ts";

import { addFailure } from "../failure/add-failure.ts";
import { valueTypeFailure } from "../failure/bags.ts";

const textEncoder = new TextEncoder();

export const pokedBytes = (
    data: Array<number | string>, failures: Array<Failure>
): Array<number> => data.flatMap((item, index) => {
    if (typeof item == "string") {
        return Array.from(textEncoder.encode(item));
    }

    if (typeof item == "number" && item >= 0 && item <= 0xff) {
        return item;
    }

    const failure = valueTypeFailure("string, byte", item);
    failure.location = {"parameter": index};
    addFailure(failures, failure);
    return 0;
});
