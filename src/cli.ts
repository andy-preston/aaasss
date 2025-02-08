import { coupling } from "./assembler/coupling.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device/device-file.ts";
import { defaultFailureMessages } from "./listing/messages.ts";
import { defaultReaderMethod } from "./source-code/file-stack.ts";

const assemble = coupling(
    "file1.asm",
    defaultReaderMethod,
    defaultFailureMessages,
    [defaultDeviceFinder, defaultJsonLoader]
);
assemble();
