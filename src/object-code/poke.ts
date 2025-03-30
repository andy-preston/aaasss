import { emptyBag } from "../assembler/bags.ts";
import { DataDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { bagOfFailures, Failure, numericTypeFailure } from "../failure/bags.ts";
import type { Code } from "./data-types.ts";

const encoder = new TextEncoder();

export const pokeBuffer = () => {
    const bytes: Array<number> = [];

    const poke = (data: Array<number | string>): DirectiveResult => {
        const failures: Array<Failure> = [];

        data.forEach((item, index) => {
            if (typeof item == "string") {
                encoder.encode(item).forEach((byte) => {
                    bytes.push(byte);
                });
            }
            else if (item < 0 || item > 0xff) {
                const failure = numericTypeFailure(
                    "type_bytesOrString", item, 0, 0xff
                );
                failure.location = {"parameter": index};
                failures.push(failure);
            }
            else {
                bytes.push(item);
            }
        });
        if (bytes.length % 2 == 1) {
            bytes.push(0);
        }
        return failures.length > 0 ? bagOfFailures(failures) : emptyBag();
    };

    const pokeDirective: DataDirective = {"type": "dataDirective", "it": poke};

    const contents = function* () {
        while (bytes.length > 0) {
            yield bytes.splice(0, 4) as unknown as Code;
        }
    };

    return {
        "pokeDirective": pokeDirective,
        "contents": contents
    };
};

export type PokeBuffer = ReturnType<typeof pokeBuffer>;
