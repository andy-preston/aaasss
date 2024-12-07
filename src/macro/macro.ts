import { TokenisedLine } from "../tokenise/tokenised-line.ts";

type MacroParameters = Array<string>;

export const macro = (name: string, parameters: MacroParameters) => {
    const lines: Array<TokenisedLine> = [];
    const saveLine = (line: TokenisedLine) => {
        lines.push(line);
    };
    return {
        "name": name,
        "parameters": parameters,
        "saveLine": saveLine
    }
};

export type Macro = Readonly<ReturnType<typeof macro>>;
