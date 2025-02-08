import { assertEquals } from "assert/equals";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("Labels in macros are expanded on each invocation", () => {
    const environment = testEnvironment();
    environment.jsExpression(
        'macro("testMacro");'
    );
    environment.macros.lines(
        testLine("", "JMP", ["nextLine"])
    ).toArray();
    environment.macros.lines(
        testLine("nextLine", "NOP", [])
    ).toArray();
    environment.jsExpression("end();");
    environment.macros.lines(testLine("", "", [])).toArray();

    environment.jsExpression('testMacro();');
    const result1 = environment.macros.lines(testLine("", "", [])).toArray();
    assertEquals(result1[1]!.mnemonic, "JMP");
    assertEquals(result1[1]!.symbolicOperands, ["testMacro$1$nextLine"]);
    assertEquals(result1[2]!.label, "testMacro$1$nextLine");

    environment.jsExpression('testMacro();');
    const result2 = environment.macros.lines(testLine("", "", [])).toArray();
    assertEquals(result2[1]!.mnemonic, "JMP");
    assertEquals(result2[1]!.symbolicOperands, ["testMacro$2$nextLine"]);
    assertEquals(result2[2]!.label, "testMacro$2$nextLine");
});

Deno.test("But labels from outside the macro are left as is", () => {
    const environment = testEnvironment();
    environment.symbolTable.defineDirective("anotherLine", 437);
    environment.jsExpression(
        'macro("testMacro");'
    );
    environment.macros.lines(
        testLine("", "JMP", ["anotherLine"])
    ).toArray();
    environment.jsExpression("end();");
    environment.macros.lines(testLine("", "", [])).toArray();

    environment.jsExpression('testMacro();');
    const result = environment.macros.lines(testLine("", "", [])).toArray();
    assertEquals(result[1]!.mnemonic, "JMP");
    assertEquals(result[1]!.symbolicOperands, ["anotherLine"]);
});
