import { box } from "../failure/failure-or-box.ts";
import type { DeviceFileOperations } from "./device-file.ts";

export const deviceMocks = (spec: object): DeviceFileOperations => [
    (name: string) => box(name),
    (_fileName: string) => ({ "spec": spec })
];
