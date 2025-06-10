import type { CurrentLine } from "../line/current-line.ts";
import type {
    VoidDirective, StringDirective, NumberDirective, BooleanDirective,
    ValueDirective, FunctionDefineDirective, FunctionUseDirective, DataDirective,
    BaggedDirective
} from "./bags.ts";

import { directiveParameters } from "./directive-parameters.ts";
import { DirectiveResult } from "./data-types.ts";

const arrayOfStrings = (them: Array<unknown>) => them.map(element => `${element}`);

export const directiveFunction = (currentLine: CurrentLine) => {
    const parameters = directiveParameters(currentLine);

    const possibleFailures = (directiveResult: DirectiveResult): string => {
        if (directiveResult.type == "failures") {
            currentLine.failures(directiveResult.it);
            return "";
        }
        return directiveResult.it;
    };

    const booleanDirective = (
        directive: BooleanDirective
    ) => (...actual: Array<unknown>) => {
        parameters.fixed(["boolean"], actual, 0);
        return possibleFailures(directive.it(Boolean(actual[0])));
    };

    const dataDirective = (
        directive: DataDirective
    ) => (...actual: Array<unknown>) => {
        const use = parameters.variable(["string", "number"], actual, 0);
        return possibleFailures(directive.it(use as Array<number | string>));
    };

    const functionDefineDirective = (
        directive: FunctionDefineDirective
    ) => (...actual: Array<unknown>) => {
        const name = parameters.firstName(actual);
        const use = parameters.variable(["string"], actual.slice(1), 1);
        return possibleFailures(directive.it(name, arrayOfStrings(use)));
    };

    const functionUseDirective = (
        symbolName: string, directive: FunctionUseDirective
    ) => (...actual: Array<unknown>) => {
        const use = parameters.variable(["string", "number"], actual, 0);
        return possibleFailures(directive.it(symbolName, arrayOfStrings(use)));
    };

    const numberDirective = (
        directive: NumberDirective
    ) => (...actual: Array<unknown>) => {
        const use = parameters.fixed(["number"], actual, 0);
        return possibleFailures(directive.it(use[0] as number));
    };

    const stringDirective = (
        directive: StringDirective
    ) => (...actual: Array<unknown>) => {
        parameters.fixed(["string"], actual, 0);
        return possibleFailures(directive.it(arrayOfStrings(actual)[0]!));
    };

    const valueDirective = (
        directive: ValueDirective
    ) => (...actual: Array<unknown>) => {
        const name = parameters.firstName(actual);
        const use = parameters.fixed(["number"], actual.slice(1), 1);
        return possibleFailures(directive.it(name, use[0] as number));
    };

    const voidDirective = (
        directive: VoidDirective
    ) => (...actual: Array<unknown>) => {
        parameters.fixed([], actual, 0);
        return possibleFailures(directive.it());
    };

    return (symbolName: string, directive: BaggedDirective) => {
        switch (directive.type) {
            case "voidDirective":
                return voidDirective(directive);
            case "stringDirective":
                return stringDirective(directive);
            case "numberDirective":
                return numberDirective(directive);
            case "booleanDirective":
                return booleanDirective(directive);
            case "valueDirective":
                return valueDirective(directive);
            case "dataDirective":
                return dataDirective(directive);
            case "functionDefineDirective":
                return functionDefineDirective(directive);
            case "functionUseDirective":
                return functionUseDirective(symbolName, directive);
        }
    };
};

export type DirectiveFunction = ReturnType<typeof directiveFunction>;
