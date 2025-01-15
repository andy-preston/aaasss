import { coupling } from "./coupling/coupling.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device/chooser.ts";
import { defaultFailureMessages } from "./listing/messages.ts";
import { outputFile } from "./assembler/output-file.ts";
import { defaultReaderMethod } from "./source-code/file-stack.ts";

const pipeline = coupling(
    "file1.asm", defaultReaderMethod, outputFile, defaultFailureMessages,
    defaultDeviceFinder, defaultJsonLoader
);
pipeline();
