import type { UncheckedParameters } from "../directives/data-types.ts";
import type { Line } from "../line/line-types.ts";

import { typeOf } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure } from "../failure/bags.ts";

export const directiveParameters = (
    uncheckedParameters: UncheckedParameters, currentLine: Line
) => {
    if (uncheckedParameters.length < 1) {
        addFailure(currentLine.failures, assertionFailure(
            "parameter_count", ">=1", `${uncheckedParameters.length}`
        ));
        return false;
    }

    return uncheckedParameters.reduce(
        (allGood, parameter, index) => {
            const actual = typeOf(parameter);
            if (actual != "string") {
                const failure = assertionFailure(
                    "parameter_type", "string", actual
                );
                failure.location = {"parameter": index + 1};
                addFailure(currentLine.failures, failure);
                return true;
            }
            return allGood;
        }, false
    );
};
