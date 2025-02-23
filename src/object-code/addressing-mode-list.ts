import { dataDirect } from "../instructions/data-direct.ts";
import { des } from "../instructions/des.ts";
import { statusManipulation } from "../instructions/status-manipulation.ts";

export const addressingModeList = [
    dataDirect, des, statusManipulation
] as const;

