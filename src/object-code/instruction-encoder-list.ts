import type { Line } from "../line/line-types.ts";

import { branchOnStatus } from "../instructions/branch-on-status.ts";
import { byteImmediate } from "../instructions/byte-immediate.ts";
import { dataDirect } from "../instructions/data-direct.ts";
import { des } from "../instructions/des.ts";
import { ioBit, ioByte } from "../instructions/io.ts";
import { nop } from "../instructions/nop.ts";
import { programMemory } from "../instructions/program-memory.ts";
import { relativeProgram } from "../instructions/relative-program.ts";
import { singleRegisterBit } from "../instructions/single-register-bit.ts";
import { singleRegisterDirect } from "../instructions/single-register-direct.ts";
import { statusManipulation } from "../instructions/status-manipulation.ts";
import { twoRegisterDirect } from "../instructions/two-register-direct.ts";

const instructionEncoderList = [
    branchOnStatus, byteImmediate, dataDirect, des, ioBit, ioByte, nop,
    programMemory, relativeProgram,
    singleRegisterBit, singleRegisterDirect, statusManipulation,
    twoRegisterDirect
] as const;

export const encoderFor = (line: Line) => {
    for (const addressingMode of instructionEncoderList) {
        const codeGenerator = addressingMode(line)
        if (codeGenerator != undefined) {
            return codeGenerator;
        }
    }
    return undefined;
};
