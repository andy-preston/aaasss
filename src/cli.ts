import { generateCode } from "./mock-ups.ts";
import { newContext } from "./context/context.ts";
import { numericOperands } from "./context/numeric-operands.ts";
import { pipeline } from "./pipeline/pipeline.ts";
import { fileStack } from "./source-files/file-stack.ts";
import { javascript } from "./source-files/javascript.ts";
import { newPass, passes } from "./state/pass.ts";
import { tokenise } from "./tokenise/tokenise.ts";

const pass = newPass(() => {});
const context = newContext(pass);
const sourceFiles = fileStack();
context.directive("include", sourceFiles.includeFile);
const getOperands = numericOperands(context);
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
