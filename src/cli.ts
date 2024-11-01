import { pipeline } from "./pipeline.ts";
import {
    generateCode, getOperands, tokenise
} from "./mock-ups.ts";
import { fileStack } from "./source-files/file-stack.ts";
import { newPass, passes } from "./state/pass.ts";
import { javascript } from "./source-files/javascript.ts";
import { newContext } from "./context/context.ts";

const pass = newPass(() => {});
const context = newContext(pass);
const sourceFiles = fileStack();
context.directive("include", sourceFiles.includeFile);
const pipe = pipeline(
    javascript(context),
    tokenise,
    getOperands,
    generateCode
);
for (const passNumber of passes) {
    pass.start(passNumber);
    for (const line of sourceFiles.lines("test1.asm")) {
        console.log(pipe(line));
    }
}
