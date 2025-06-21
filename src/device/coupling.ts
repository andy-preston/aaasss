import type { StringDirective } from "../directives/bags.ts";
import type { DeviceChooser } from "./chooser.ts";

export const deviceCoupling = (chooser: DeviceChooser) => {
    const deviceDirective: StringDirective = {
        "type": "stringDirective", "it": chooser
    };
    return { "deviceDirective": deviceDirective };
};
