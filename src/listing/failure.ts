import type {
    AssertionFailure, ClueFailure, DefinitionFailure,
    ExceptionFailure, Failure, NumericTypeFailure
} from "../failure/bags.ts";

export const location = (operand: string, parameter: string) =>
    (failure: Failure, messages: Array<string>) =>
        failure.location != undefined && "operand" in failure.location
        ? messages.concat([`${operand}: ${failure.location.operand}`])
        :
        failure.location != undefined && "parameter" in failure.location
        ? messages.concat([`${parameter}: ${failure.location.parameter}`])
        :
        messages;

export const assertionFailure = (
    messages: Array<string>, expected: string, actual: string,
    failure: AssertionFailure
) => messages.concat([
    `${expected}: ${failure.expected}`, `${actual}: ${failure.actual}`
]);

export const clueFailure = (
    messages: Array<string>, clue: string,
    failure: ClueFailure
) => messages.concat([`${clue}: ${failure.clue}`]);

export const definitionFailure = (
    messages: Array<string>, name: string, definition: string,
    failure: DefinitionFailure
) => messages.concat([
    `${name}: ${failure.name}`, `${definition}: ${failure.definition}`
]);

export const exceptionFailure = (
    messages: Array<string>, exception: string, message: string,
    failure: ExceptionFailure
) => messages.concat([
    `${exception}: ${failure.exception}`, `${message}: ${failure.message}`
]);

export const numericTypeFailure = (
    messages: Array<string>, expected: string, actual: string,
    failure: NumericTypeFailure
) => {
    const extra: Array<string> = [];
    if (failure.min != undefined || failure.max != undefined) {
        extra.push([
            `${expected}`,
            failure.min == undefined ? "" : '${failure.min}',
            " - ",
            failure.max == undefined ? "" : '${failure.max}',
        ].join(""));
    };
    extra.push(`${actual}: ${failure.value}`);
    return messages.concat(extra);
};
