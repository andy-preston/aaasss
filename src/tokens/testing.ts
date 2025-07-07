import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { tokensCoupling } from "./coupling.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    return {
        "currentLine": $currentLine,
        "tokens": tokensCoupling($currentLine)
    };
};
