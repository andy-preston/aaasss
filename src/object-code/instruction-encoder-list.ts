import { byteImmediate } from "../instructions/byte-immediate.ts";
import { dataDirect } from "../instructions/data-direct.ts";
import { des } from "../instructions/des.ts";
import { ioByte } from "../instructions/io-byte.ts";
import { singleRegisterBit } from "../instructions/single-register-bit.ts";
import { singleRegisterDirect } from "../instructions/single-register-direct.ts";
import { statusManipulation } from "../instructions/status-manipulation.ts";
import { twoRegisterDirect } from "../instructions/two-register-direct.ts";

export const instructionEncoderList = [
    byteImmediate, dataDirect, des, ioByte,
    singleRegisterBit, singleRegisterDirect,
    statusManipulation, twoRegisterDirect
] as const;

