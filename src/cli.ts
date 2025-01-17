import { coupling } from "./assembler/coupling.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device/device-file.ts";
import { defaultFailureMessages } from "./listing/messages.ts";
import { outputFile } from "./assembler/output-file.ts";
import { defaultReaderMethod } from "./source-code/file-stack.ts";

const assemble = coupling(
    "file1.asm", defaultReaderMethod, outputFile, defaultFailureMessages,
    [defaultDeviceFinder, defaultJsonLoader]
);
assemble();
