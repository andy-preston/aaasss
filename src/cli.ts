import { coupling } from "./assembler/coupling.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "./device/file.ts";
import { defaultFailureMessages } from "./listing/languages.ts";
import { defaultReaderMethod } from "./source-code/file-stack.ts";

const assemble = coupling(
    Deno.args[0]!,
    defaultReaderMethod,
    defaultFailureMessages,
    [defaultDeviceFinder, defaultTomlLoader]
);
assemble();
