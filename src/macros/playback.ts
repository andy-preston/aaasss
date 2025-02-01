import type { Directive } from "../directives/directive.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import { operands, type SymbolicOperands } from "../operands/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, Macro, MacroName } from "./data-types.ts";
import { labelsAndOperands } from "./labels-operands.ts";
import { lineWithExpandedMacro } from "./line-types.ts";
import type { MacroList } from "./macros.ts";

export const playback = (macros: MacroList) => {
    let theMacro: Macro | undefined = undefined;
    let withParameters: ActualParameters | undefined = undefined;
    let named: MacroName = "";

    const directive: Directive = (
        name: MacroName, parameters: ActualParameters
    ) => {
        const checkedName = stringParameter(name);
        if (checkedName.which == "failure") {
            return checkedName;
        }
        if (!macros.has(name)) {
            return failure(undefined, "macro_notExist", name);
        }
        const checkedParameters = parameterList(parameters, "type_macroParams");
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        theMacro = macros.get(name)!;
        named = name;
        withParameters = checkedParameters.value == "undefined"
            ? []
            : parameters;
        return emptyBox();
    };

    const reset = () => {
        theMacro = undefined;
        named = "";
        withParameters = undefined;
    };

    const parametersMatch = () =>
        theMacro!.parameters.length != withParameters!.length;

    const playback = function* (callingLine: LineWithTokens) {
        const map = labelsAndOperands(theMacro!, named, withParameters!);
        for (const [index, line] of theMacro!.lines.entries()) {
            const symbolicOperands = line.symbolicOperands.map(map.operand);
            const expandedLine = lineWithExpandedMacro(
                callingLine,
                line,
                map.label(line.label),
                operands<SymbolicOperands>(symbolicOperands)
            );
            if (index == 0 && parametersMatch()) {
                expandedLine.withFailure(failure(
                    undefined, "macro_params", `${withParameters!.length}`
                ));
            }
            yield expandedLine;
        }
        reset();
    };

    const play = () => theMacro == undefined ? undefined : playback;

    return {
        "reset": reset,
        "directive": directive,
        "play": play
    };
};

export type Playback = ReturnType<typeof playback>;
