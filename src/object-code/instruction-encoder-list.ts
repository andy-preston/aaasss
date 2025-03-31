import { dataDirect } from "../instructions/data-direct.ts";
import { des } from "../instructions/des.ts";
import { ioByte } from "../instructions/io-byte.ts";
import { statusManipulation } from "../instructions/status-manipulation.ts";
import { twoRegisterDirect } from "../instructions/two-register-direct.ts";

export const instructionEncoderList = [
    dataDirect, des, ioByte, statusManipulation, twoRegisterDirect
] as const;

