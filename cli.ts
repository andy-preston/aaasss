import { pipeline } from "./line";
import {
    generateCode, getOperands, nextLine, splitJavascript, tokenise
} from "./mock-ups";

const pipe = pipeline(splitJavascript, tokenise, getOperands, generateCode);
for (const line of nextLine()) {
    console.log(pipe(line));
}
