import { ImmutableLine } from "./line-types.ts";

export const currentLine = () => {
    let theLine: ImmutableLine | undefined;

    const forDirectives = (line: ImmutableLine) => {
        theLine = line;
    };

    const directiveBackdoor = () => theLine;

    return {
        "directiveBackdoor": directiveBackdoor,
        "forDirectives": forDirectives
    };
};

export type CurrentLine = ReturnType<typeof currentLine>;
