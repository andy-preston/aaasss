import { pipeline } from "./pipeline.ts";
import {
    generateCode, getOperands, nextLine, splitJavascript, tokenise
} from "./mock-ups.ts";

const pipe = pipeline(splitJavascript, tokenise, getOperands, generateCode);
for (const line of nextLine()) {
    console.log(pipe(line));
}
