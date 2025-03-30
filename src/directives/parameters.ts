import { emptyBag } from "../assembler/bags.ts";
import {
    bagOfFailures, boringFailure, clueFailure, typeFailure,
    type BagOrFailures, type Failure
} from "../failure/bags.ts";
import type {
    VoidDirective, StringDirective, NumberDirective, ValueDirective,
    FunctionDefineDirective, FunctionUseDirective, DataDirective
} from "./bags.ts";
import type { JavaScriptFunction } from "./data-types.ts";

const arrayOfStrings = (them: unknown[]) => them.map(element => `${element}`);


const parameterTypes = (
    givenParameters: unknown[],
    requiredTypes: Array<"string" | "number">,
    length: number | undefined
): BagOrFailures => {
    const requiredIncludes = (requiredType: string) =>
        (requiredTypes as Array<string>).includes(requiredType);

    const failures: Array<Failure> = [];

    if (length != undefined && length != givenParameters.length) {
        failures.push(clueFailure("parameter_count", `${length}`));
    }

    givenParameters.forEach((parameter, index) => {
        if (length != undefined && index >= length) {
            return;
        }
        const typeOf = Array.isArray(parameter) ? "array" : typeof parameter;
        if (!requiredIncludes(typeOf)) {
            const failure = typeFailure(
                "type_failure", requiredTypes.join(", "), typeOf
            );
            failure.location = { "parameter": index };
            failures.push(failure);
        }
    });

    return failures.length == 0 ? emptyBag() : bagOfFailures(failures);
}

export const voidDirective = (
    directive: VoidDirective
): JavaScriptFunction => (...parameters: unknown[]) =>
    parameters.length != 0
        ? bagOfFailures([clueFailure("parameter_count", "0")])
        : directive.it();

export const stringDirective = (
    directive: StringDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string"], 1);
    return check.type == "failures"
        ? check
        : directive.it(arrayOfStrings(parameters)[0]!);
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
    if (`${given}` != `${numeric}`) {
        const failure = typeFailure("type_failure", "number", "string");
        failure.location = { "parameter": 0 };
        return bagOfFailures([failure]);
    }
    return directive.it(numeric);
};

export const valueDirective = (
    directive: ValueDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    if (parameters.length != 2) {
        return bagOfFailures([clueFailure("parameter_count", "2")]);
    }
    const typeOfFirst = typeof parameters[0];
    if (typeOfFirst != "string") {
        const failure = typeFailure("type_failure", "string", typeOfFirst);
        failure.location = { "parameter": 0 };
        return bagOfFailures([failure]);
    }
    const typeOfSecond = typeof parameters[1];
    if (typeOfSecond != "number") {
        const failure = typeFailure("type_failure", "number", typeOfSecond);
        failure.location = { "parameter": 1 };
        return bagOfFailures([failure]);
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
        return bagOfFailures([boringFailure("parameter_firstName")]);
    }
    const check = parameterTypes(parameters, ["string"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(
            parameters[0] as string, arrayOfStrings(parameters.slice(1))
        );
};

export const functionUseDirective = (
    symbolName: string, directive: FunctionUseDirective
): JavaScriptFunction => (...parameters: unknown[]) => {
    const check = parameterTypes(parameters, ["string", "number"], undefined);
    return check.type == "failures"
        ? check
        : directive.it(symbolName, arrayOfStrings(parameters));
};
