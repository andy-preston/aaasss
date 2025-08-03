import { coupling } from "./assembler/coupling.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "./device/file.ts";
import { defaultFailureMessages } from "./listing/languages.ts";
import { defaultReaderMethod } from "./source-code/reader.ts";

coupling(
    Deno.args[0]!,
    defaultReaderMethod,
    defaultFailureMessages,
    [defaultDeviceFinder, defaultTomlLoader],
    true
);
