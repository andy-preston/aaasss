import type { Line } from "./line-types.ts";

export const currentLine = () => {
    let theLine: Line | undefined;

    return (line?: Line) => {
        if (line != undefined) {
            theLine = line;
        }
        return theLine!;
    };
};

export type CurrentLine = ReturnType<typeof currentLine>;
