import type { Mnemonic } from "../tokens/data-types.ts";
import type { Template } from "../object-code/data-types.ts";
import type { InstructionOperands } from "../operands/data-types.ts";

type Instructions = Record<Mnemonic, [Template, InstructionOperands?]>;

export const instructions: Instructions = {
    // Implicit
    "BREAK":  ["1001_0101 1001_1000"                                                       ],
    "NOP":    ["0000_0000 0000_0000"                                                       ],
    "RET":    ["1001_0101 0000_1000"                                                       ],
    "RETI":   ["1001_0101 0001_1000"                                                       ],
    "SLEEP":  ["1001_0101 1000_1000"                                                       ],
    "WDR":    ["1001_0101 1010_1000"                                                       ],
    // Direct Program Addressing
    "CALL":   ["1001_010a aaaa_111a aaaa_aaaa aaaa_aaaa",
                                      {"a": "22BitProgramAddress"                         }],
    "JMP":    ["1001_010a aaaa_110a aaaa_aaaa aaaa_aaaa",
                                      {"a": "22BitProgramAddress"                         }],
    // Indirect Program Addressing
    "IJMP":   ["1001_0100 0000_1001"                                                       ],
    "EIJMP":  ["1001_0100 0001_1001"                                                       ],
    "ICALL":  ["1001_0101 0000_1001"                                                       ],
    "EICALL": ["1001_0101 0001_1001"                                                       ],
    // Relative Program Addressing
    "RCALL":  ["1101_aaaa aaaa_aaaa", {"a": "12BitRelative"                               }],
    "RJMP":   ["1100_aaaa aaaa_aaaa", {"a": "12BitRelative"                               }],
    // Relative Branch on Status
    "BRBC":   ["1111_01aa aaaa_abbb", {"b": "bitIndex",           "a": "7BitRelative"     }],
    "BRSH":   ["1111_01aa aaaa_a000", {"a": "7BitRelative"                                }],
    "BRCC":   ["1111_01aa aaaa_a000", {"a": "7BitRelative"                                }],
    "BRNE":   ["1111_01aa aaaa_a001", {"a": "7BitRelative"                                }],
    "BRPL":   ["1111_01aa aaaa_a010", {"a": "7BitRelative"                                }],
    "BRVC":   ["1111_01aa aaaa_a011", {"a": "7BitRelative"                                }],
    "BRGE":   ["1111_01aa aaaa_a100", {"a": "7BitRelative"                                }],
    "BRHC":   ["1111_01aa aaaa_a101", {"a": "7BitRelative"                                }],
    "BRTC":   ["1111_01aa aaaa_a110", {"a": "7BitRelative"                                }],
    "BRID":   ["1111_01aa aaaa_a111", {"a": "7BitRelative"                                }],
    "BRBS":   ["1111_00aa aaaa_abbb", {"b": "bitIndex",           "a": "7BitRelative"     }],
    "BRCS":   ["1111_00aa aaaa_a000", {"a": "7BitRelative"                                }],
    "BRLO":   ["1111_00aa aaaa_a000", {"a": "7BitRelative"                                }],
    "BREQ":   ["1111_00aa aaaa_a001", {"a": "7BitRelative"                                }],
    "BRMI":   ["1111_00aa aaaa_a010", {"a": "7BitRelative"                                }],
    "BRVS":   ["1111_00aa aaaa_a011", {"a": "7BitRelative"                                }],
    "BRLT":   ["1111_00aa aaaa_a100", {"a": "7BitRelative"                                }],
    "BRHS":   ["1111_00aa aaaa_a101", {"a": "7BitRelative"                                }],
    "BRTS":   ["1111_00aa aaaa_a110", {"a": "7BitRelative"                                }],
    "BRIE":   ["1111_00aa aaaa_a111", {"a": "7BitRelative"                                }],
    // Status Manipulation
    "BCLR":   ["1001_0100 1vvv_1000", {"v":  "bitIndex"                                   }],
    "CLC":    ["1001_0100 1000_1000"                                                       ],
    "CLZ":    ["1001_0100 1001_1000"                                                       ],
    "CLN":    ["1001_0100 1010_1000"                                                       ],
    "CLV":    ["1001_0100 1011_1000"                                                       ],
    "CLS":    ["1001_0100 1100_1000"                                                       ],
    "CLH":    ["1001_0100 1101_1000"                                                       ],
    "CLT":    ["1001_0100 1110_1000"                                                       ],
    "CLI":    ["1001_0100 1111_1000"                                                       ],
    "BSET":   ["1001_0100 0vvv_1000", {"v":  "bitIndex"                                   }],
    "SEC":    ["1001_0100 0000_1000"                                                       ],
    "SEZ":    ["1001_0100 0001_1000"                                                       ],
    "SEN":    ["1001_0100 0010_1000"                                                       ],
    "SEV":    ["1001_0100 0011_1000"                                                       ],
    "SES":    ["1001_0100 0100_1000"                                                       ],
    "SEH":    ["1001_0100 0101_1000"                                                       ],
    "SET":    ["1001_0100 0110_1000"                                                       ],
    "SEI":    ["1001_0100 0111_1000"                                                       ],
    // Single Register Bit
    "BLD":    ["1111_100r rrrr_0nnn", {"r":  "register",          "n": "bitIndex"         }],
    "BST":    ["1111_101r rrrr_0nnn", {"r":  "register",          "n": "bitIndex"         }],
    "SBRC":   ["1111_110r rrrr_0nnn", {"r":  "register",          "n": "bitIndex"         }],
    "SBRS":   ["1111_111r rrrr_0nnn", {"r":  "register",          "n": "bitIndex"         }],
    // Single Register Direct
    "ASR":    ["1001_010r rrrr_0101", {"r":  "register"                                   }],
    "COM":    ["1001_010r rrrr_0000", {"r":  "register"                                   }],
    "DEC":    ["1001_010r rrrr_1010", {"r":  "register"                                   }],
    "INC":    ["1001_010r rrrr_0011", {"r":  "register"                                   }],
    "LSR":    ["1001_010r rrrr_0110", {"r":  "register"                                   }],
    "NEG":    ["1001_010r rrrr_0001", {"r":  "register"                                   }],
    "POP":    ["1001_000r rrrr_1111", {"r":  "register"                                   }],
    "PUSH":   ["1001_001r rrrr_1111", {"r":  "register"                                   }],
    "ROR":    ["1001_010r rrrr_0111", {"r":  "register"                                   }],
    "SWAP":   ["1001_010r rrrr_0010", {"r":  "register"                                   }],
    // (Read Modify Write)
    "LAC":    ["1001_001r rrrr_0110", {"_":  "onlyZ",             "r": "register"         }],
    "LAS":    ["1001_001r rrrr_0101", {"_":  "onlyZ",             "r": "register"         }],
    "LAT":    ["1001_001r rrrr_0111", {"_":  "onlyZ",             "r": "register"         }],
    "XCH":    ["1001_001r rrrr_0100", {"_":  "onlyZ",             "r": "register"         }],
    // Two Register Direct
    "CPC":    ["0000_01sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "SBC":    ["0000_10sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "ADD":    ["0000_11sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "LSL":    ["0000_11sd dddd_ssss", {"ds": "register"                                   }],
    "CPSE":   ["0001_00sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "CP":     ["0001_01sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "SUB":    ["0001_10sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "ADC":    ["0001_11sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "ROL":    ["0001_11sd dddd_ssss", {"ds": "register"                                   }],
    "AND":    ["0010_00sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "TST":    ["0010_00sd dddd_ssss", {"ds": "register"                                   }],
    "EOR":    ["0010_01sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "CLR":    ["0010_01sd dddd_ssss", {"ds": "register"                                   }],
    "OR":     ["0010_10sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "MOV":    ["0010_11sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    "MUL":    ["1001_11sd dddd_ssss", {"d":  "register",          "s": "register"         }],
    // Multiply
    "FMUL":   ["0000_0011 0ddd_1sss", {"d":  "registerMultiply",  "s": "registerMultiply" }],
    "FMULS":  ["0000_0011 1ddd_0sss", {"d":  "registerMultiply",  "s": "registerMultiply" }],
    "FMULSU": ["0000_0011 1ddd_1sss", {"d":  "registerMultiply",  "s": "registerMultiply" }],
    "MULSU":  ["0000_0011 0ddd_0sss", {"d":  "registerMultiply",  "s": "registerMultiply" }],
    "MULS":   ["0000_0010 dddd_ssss", {"d":  "registerImmediate", "s": "registerImmediate"}],
    // Word Immediate    cSpell:words nnrr
    "ADIW":   ["1001_0110 nnrr_nnnn", {"r":  "registerPair",      "n": "6BitNumber"       }],
    "SBIW":   ["1001_0111 nnrr_nnnn", {"r":  "registerPair",      "n": "6BitNumber"       }],
    // Byte Immediate
    "CPI":    ["0011_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "SBCI":   ["0100_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "SUBI":   ["0101_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "ORI":    ["0110_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "SBR":    ["0110_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "ANDI":   ["0111_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "CBR":    ["0111_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "invertedByte"     }],
    "LDI":    ["1110_nnnn rrrr_nnnn", {"r":  "registerImmediate", "n": "byte"             }],
    "SER":    ["1110_1111 rrrr_1111", {"r":  "registerImmediate"                          }],
    // Bitwise IO
    "SBI":    ["1001_1010 aaaa_abbb", {"a":  "ioPort",            "b": "bitIndex"         }],
    "CBI":    ["1001_1000 aaaa_abbb", {"a":  "ioPort",            "b": "bitIndex"         }],
    "SBIC":   ["1001_1001 aaaa_abbb", {"a":  "ioPort",            "b": "bitIndex"         }],
    "SBIS":   ["1001_1011 aaaa_abbb", {"a":  "ioPort",            "b": "bitIndex"         }],
    // Full Byte IO
    "IN":     ["1011_0aar rrrr_aaaa", {"r": "register",           "a": "ioPort"           }],
    "OUT":    ["1011_1aar rrrr_aaaa", {"a": "ioPort",             "r": "register"         }],
    // DES
    "DES":    ["1001_0100 nnnn_1011", {"n":  "nybble"                                     }],
    // Program memory
    "SPM":    ["1001_0101 111b_1000", {"b":  "optionalZ+"                                 }],
    "ELPM":   ["1001_000r rrrr_011b", {"r":  "register",          "b": "ZorZ+"            }],
    "LPM":    ["1001_000r rrrr_010b", {"r":  "register",          "b": "ZorZ+"            }]
};

export const lpmImplied: Instructions = {
    "ELPM": ["1001_0101 1101_1000"],
    "LPM":  ["1001_0101 1100_1000"]
};

export const nonReducedCore: Instructions = {
    "LDS": ["1001_000r rrrr_0000 aaaa_aaaa aaaa_aaaa", {"r": "register",         "a": "16BitDataAddress"}],
    "STS": ["1001_001r rrrr_0000 aaaa_aaaa aaaa_aaaa", {"a": "16BitDataAddress", "r": "register"        }]
};

export const withReducedCore: Instructions = {
    "LDS": ["1010_0aaa rrrr_aaaa", {"r": "registerImmediate", "a": "7BitDataAddress"  }],
    "STS": ["1010_1aaa rrrr_aaaa", {"a": "7BitDataAddress",   "r": "registerImmediate"}]
};
