import { emptyBag } from "../assembler/bags.ts";
import { oldFailure, bagOfFailures, BagOrFailures } from "../failure/bags.ts";
import type {
    VoidDirective, StringDirective, NumberDirective, ValueDirective,
    FunctionDefineDirective, FunctionUseDirective, DataDirective
} from "./bags.ts";
import type { JavaScriptFunction } from "./data-types.ts";

const cleverType = (it: unknown) => Array.isArray(it) ? "array" : typeof it;

const allAsString = (them: unknown[]) => them.map(element => `${element}`);

const parameterTypes = (
    them: unknown[],
    required: Array<"string" | "number">,
    length: number | undefined
): BagOrFailures => {
    const requiredIncludes = (included: string) =>
        (required as Array<string>).includes(included);

    if (length != undefined && length != them.length) {
        return bagOfFailures([
            oldFailure("parameter_count", [`${length}`])
        ]);
    }

    const wrongTypes: Array<string> = [];
    for (const [index, parameter] of them.entries()) {
        const typeOf = cleverType(parameter);
        if (!requiredIncludes(typeOf)) {
            wrongTypes.push(`${index}: ${typeOf}`);
        }
    }
    return wrongTypes.length == 0
        ? emptyBag()
        : bagOfFailures([
            oldFailure("parameter_type", [required.join(", ")].concat(wrongTypes))
        ]);
}

export const voidDirective = (
    directive: VoidDirective
): JavaScriptFunction => (...parameters: unknown[]) =>
    parameters.length != 0
        ? bagOfFailures([oldFailure("parameter_count", ["0"])])
        : directive.it();

export const stringDirective = (
    directive: StringDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string"], 1);
    return check.type == "failures"
        ? check
        : directive.it(allAsString(parameters)[0]!);
};

export const numberDirective = (
    directive: NumberDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], 1);
    if (check.type == "failures") {
        return check;
    }
    const given = parameters[0]! as number | string;
    const numeric = typeof given == "string" ? parseInt(given) : given;
    return `${given}` != `${numeric}`
        ? bagOfFailures([
            oldFailure("parameter_type", ["number", "0: string"])
        ])
        : directive.it(numeric);
};

export const valueDirective = (
    directive: ValueDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length != 2) {
        return bagOfFailures([
            oldFailure("parameter_count", ["2"])
        ]);
    }
    const typeOfFirst = typeof parameters[0];
    if (typeOfFirst != "string") {
        return bagOfFailures([
            oldFailure("parameter_type", ["string", `0: ${typeOfFirst}`])
        ]);
    }
    const typeOfSecond = typeof parameters[1];
    if (typeOfSecond != "number") {
        return bagOfFailures([
            oldFailure("parameter_type", ["number", `1: ${typeOfSecond}`])
        ]);
    }
    return directive.it(parameters[0] as string, parameters[1] as number);
};

export const dataDirective = (
    directive: DataDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    if (check.type == "failures") {
        return check;
    }
    return directive.it(parameters as Array<number | string>);
};

export const functionDefineDirective = (
    directive: FunctionDefineDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length == 0) {
        return bagOfFailures([
            oldFailure("parameter_firstName", [])
        ]);
    }
    const check = parameterTypes(parameters, ["string"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(
            parameters[0] as string, allAsString(parameters.slice(1))
        );
};

export const functionUseDirective = (
    symbolName: string, directive: FunctionUseDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(symbolName, allAsString(parameters));
};
