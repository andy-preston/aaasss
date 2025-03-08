import { stringBag } from "../assembler/bags.ts";
import type { DeviceSpec, RawItems } from "./data-types.ts";
import type { DeviceFileOperations } from "./device-file.ts";

export const deviceMocks = (spec: object): DeviceFileOperations => [
    (name: string) => stringBag(name),
    (_fileName: string): DeviceSpec => ({ "spec": spec as RawItems })
];
