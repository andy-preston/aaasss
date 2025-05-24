import type { Line } from "./line-types.ts";

export const currentLine = () => {
    let theLine: Line | undefined;

    const forDirectives = (line: Line) => {
        theLine = line;
    };

    const directiveBackdoor = () => theLine;

    return {
        "directiveBackdoor": directiveBackdoor,
        "forDirectives": forDirectives
    };
};

export type CurrentLine = ReturnType<typeof currentLine>;
