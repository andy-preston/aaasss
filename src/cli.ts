import { coupling } from "./coupling/coupling.ts";
import { outputFile } from "./output/output-file.ts";
import { defaultFailureMessages } from "./listing/messages.ts";
import { defaultReaderMethod } from "./source-code/file-stack.ts";

const pipeline = coupling(
    "file1.asm", defaultReaderMethod, outputFile, defaultFailureMessages
);
pipeline();
