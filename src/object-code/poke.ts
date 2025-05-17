import type { DataDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { Failure } from "../failure/bags.ts";
import type { CurrentLine } from "../line/current-line.ts";

import { emptyBag } from "../assembler/bags.ts";
import { bagOfFailures, numericTypeFailure } from "../failure/bags.ts";
import { codeAsWords } from "./as-words.ts";

const encoder = new TextEncoder();

export const poke = (currentLine: CurrentLine) => {
    const poke = (data: Array<number | string>): DirectiveResult => {
        const failures: Array<Failure> = [];

        const bytes = function* (): Generator<number, void, void> {
            for (const [index, item] of data.entries()) {
                if (typeof item == "string") {
                    for (const byte of encoder.encode(item)) {
                        yield byte;
                    };
                    continue;
                }

                if (item < 0 || item > 0xff) {
                    const failure = numericTypeFailure(
                        "type_bytesOrString", item, 0, 0xff
                    );
                    failure.location = {"parameter": index};
                    failures.push(failure);
                    continue;
                }

                yield item;
            }
        };

        const code = currentLine.directiveBackdoor()!.code;
        codeAsWords(bytes()).forEach((word) => {
            code.push(word);
        });
        return failures.length > 0 ? bagOfFailures(failures) : emptyBag();
    };

    const pokeDirective: DataDirective = {"type": "dataDirective", "it": poke};

    return {"pokeDirective": pokeDirective};
};

export type Poke = ReturnType<typeof poke>;
