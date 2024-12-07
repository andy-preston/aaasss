import { assemblyLine, tokenisedLine } from "../line-types/lines.ts";
import { rawLine } from "../source-code/raw-line.ts";
import { processor } from "./processor.ts";

const testLine = (label: string, mnemonic: string) => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    return tokenisedLine(assembly, label, mnemonic, [], []);
};

Deno.test("Whilst a macro is being defined, saveLine will... save lines", () => {
    const macroProcessor = processor();
    macroProcessor.defineDirective("plop")
    macroProcessor.saveLine(testLine("testLabel", "TST"));
    macroProcessor.saveLine(testLine("", "AND"));
    macroProcessor.saveLine(testLine("", "TST"));
    macroProcessor.endDirective();
});
