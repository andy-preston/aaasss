import { coupling } from "./coupling/coupling.ts";
import { outputFile } from "./output/file.ts";
import { defaultFailureMessages } from "./output/messages.ts";
import { defaultReaderMethod } from "./source-code/file-stack.ts";

const pipeline = coupling(
    "file1.asm", defaultReaderMethod, outputFile, defaultFailureMessages
);
pipeline();
