import { box } from "../failure/failure-or-box.ts";
import type { DeviceSpec, RawItems } from "./data-types.ts";
import type { DeviceFileOperations } from "./device-file.ts";

export const deviceMocks = (spec: object): DeviceFileOperations => [
    (name: string) => box(name),
    (_fileName: string): DeviceSpec => ({ "spec": spec as RawItems })
];
