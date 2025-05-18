import type {
    AssertionFailure, ClueFailure, DefinitionFailure,
    ExceptionFailure, NumericTypeFailure,
    SupportFailure
} from "../failure/bags.ts";

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

export const supportFailure = (
    messages: Array<string>,
    unsupported: string, suggestion: string, reason: string | undefined,
    failure: SupportFailure
) => {
    messages.push(`${unsupported}: ${failure.used}`);
    if (failure.suggestion != undefined) {
        const message = `${suggestion}: ${failure.suggestion}`;
        messages.push(
            reason == undefined ? message : `${message} ${reason}`
        );
    }
    return messages;
};
