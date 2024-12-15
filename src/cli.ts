import { coupling } from "./coupling/coupling.ts";
import { outputFile } from "./output/file.ts";

const pipeline = coupling("file1.asm", Deno.readTextFileSync, outputFile);
pipeline();
