import { dataDirect } from "../instructions/data-direct.ts";
import { des } from "../instructions/des.ts";

export const addressingModeList = [
    dataDirect, des
] as const;

