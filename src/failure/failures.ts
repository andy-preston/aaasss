import type { Failure } from "./bags.ts";

export const failures = () => {
    const theList: Array<Failure> = [];

    return (additional?: Failure) => {
        if (additional != undefined) {
            const duplicate = theList.find(existing => {
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
                theList.push(additional);
            }
        }
        return theList;
    };
};

export type Failures = ReturnType<typeof failures>;
