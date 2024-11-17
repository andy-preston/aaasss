import { newPass, passes } from "../state/pass.ts";
import { newContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { fileStack } from "../source-files/file-stack.ts";
import { javascript } from "../source-files/javascript.ts";
import { tokenise } from "../tokenise/tokenise.ts";
import { codeGenerator } from "../generate/code-generator.ts";
import { output } from "../output/output.ts";

export const coupling = () => {
    const pass = newPass(() => {});
    const context = newContext();
    const device = deviceProperties(context);
    const sourceFiles = fileStack();
    context.directive("include", sourceFiles.includeFile);
    const assembly = javascript(context);
    const code = codeGenerator(context, device.public, pass);
    const result = output(pass);
    for (const passNumber of passes) {
        pass.start(passNumber);
        for (const line of sourceFiles.lines("test1.asm")) {
            result(code(tokenise(assembly(line))));
        }
    }
};
