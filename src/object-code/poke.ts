import type { DataDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { Failure } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { ObjectCode } from "./object-code.ts";

import { emptyBag } from "../assembler/bags.ts";
import { bagOfFailures, numericTypeFailure } from "../failure/bags.ts";

const encoder = new TextEncoder();

export const poke = (currentLine: CurrentLine, objectCode: ObjectCode) => {
    const poke = (data: Array<number | string>): DirectiveResult => {
        const failures: Array<Failure> = [];

        const bytes = data.flatMap((item, index) => {
            if (typeof item == "string") {
                return Array.from(encoder.encode(item));
            }

            if (item < 0 || item > 0xff) {
                const failure = numericTypeFailure(
                    "type_bytesOrString", item, 0, 0xff
                );
                failure.location = {"parameter": index};
                failures.push(failure);
                return [];
            }

            return item;
        });

        const line = currentLine.directiveBackdoor()!;
        objectCode.toLine(line, bytes);
        return failures.length > 0 ? bagOfFailures(failures) : emptyBag();
    };

    const pokeDirective: DataDirective = {"type": "dataDirective", "it": poke};

    return {"pokeDirective": pokeDirective};
};

export type Poke = ReturnType<typeof poke>;
