import type { Mnemonic } from "../tokens/data-types.ts";

import { failureKinds } from "../failure/kinds.ts";

type Kind = typeof failureKinds["notSupported"][number];
type IoAlternatives = {"try": string, "kind": Kind};

export const ioAlternatives: Record<string, IoAlternatives> = {
    "SBI__ioPort":  {"try": "SBR & STS",  "kind": "notSupported_ioRange"},
    "SBIC__ioPort": {"try": "LDS & SBRC", "kind": "notSupported_ioRange"},
    "SBIS__ioPort": {"try": "LDS & SBRS", "kind": "notSupported_ioRange"},
    "CBI__ioPort":  {"try": "CBR & STS",  "kind": "notSupported_ioRange"},
    "IN__ioPort":   {"try": "LDS",        "kind": "notSupported_ioRange"},
    "OUT__ioPort":  {"try": "STS",        "kind": "notSupported_ioRange"}
};

export const simpleAlternatives: Record<Mnemonic, Mnemonic> = {
    "CALL":   "RCALL",
    "EICALL": "ICALL",
    "JMP":    "RJMP",
    "EIJMP":  "IJMP",
    "ELPM":   "LPM"
};
