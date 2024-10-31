import { pipeline } from "./pipeline.ts";
import {
    generateCode, getOperands, splitJavascript, tokenise
} from "./mock-ups.ts";
import { fileStack } from "./source-files/file-stack.ts";

const sourceFiles = fileStack();
console.log(sourceFiles.includeFile);

const pipe = pipeline(splitJavascript, tokenise, getOperands, generateCode);
for (const line of sourceFiles.lines("test1.asm")) {
    console.log(pipe(line));
}
