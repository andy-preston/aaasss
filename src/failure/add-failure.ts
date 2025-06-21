import type { Failure } from "./bags.ts";

export const addFailure = (failures: Array<Failure>, additional: Failure) => {
    const duplicate = failures.find(existing => {
        if (existing.kind != additional.kind) {
            return false;
        }
        for (const [key, value] of Object.entries(existing)) {
            if (additional[key as keyof Failure] != value) {
                return false;
            }
        }
        return true;
    });
    if (duplicate == undefined) {
        failures.push(additional);
    }
};
