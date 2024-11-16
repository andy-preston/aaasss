import { newPass, passes } from "../state/pass.ts";
import { newContext } from "../context/context.ts";
import { fileStack } from "../source-files/file-stack.ts";
import { javascript } from "../source-files/javascript.ts";
import { tokenise } from "../tokenise/tokenise.ts";
import { numericOperands } from "../context/numeric-operands.ts";
import { generateCode } from "../mock-ups.ts";
import { output } from "../output/output.ts";
import { pipeline } from "./pipeline.ts";

export const coupling = () => {
    const pass = newPass(() => {});
    const context = newContext(pass);
    const sourceFiles = fileStack();
    context.directive("include", sourceFiles.includeFile);
    const getOperands = numericOperands(context);
    const pipe = pipeline(
        javascript(context),
        tokenise,
        getOperands,
        ////////////////////////////////////////////////////////////////////////////
        //
        // TODO: code generation needs to aware of passes. Any operands that are
        // unavailable in the first pass need the most sensible default that the
        // specific code generation function needs to get the code into the
        // correct shape.
        //
        ////////////////////////////////////////////////////////////////////////////
        generateCode,
        output(pass)
    );
    for (const passNumber of passes) {
        pass.start(passNumber);
        for (const line of sourceFiles.lines("test1.asm")) {
            pipe(line);
        }
    }
};
