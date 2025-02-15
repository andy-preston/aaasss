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

    const lines = environment.fileStack.lines();
    lines.next();

    environment.jsExpression('testMacro();');
    assertEquals(lines.next().value!.rawSource, "JMP testMacro$1$nextLine");
    assertEquals(lines.next().value!.rawSource, "testMacro$1$nextLine: NOP");

    environment.jsExpression('testMacro();');
    assertEquals(lines.next().value!.rawSource, "JMP testMacro$2$nextLine");
    assertEquals(lines.next().value!.rawSource, "testMacro$2$nextLine: NOP");
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

    const lines = environment.fileStack.lines();
    lines.next();

    environment.jsExpression('testMacro();');
    assertEquals(lines.next().value!.rawSource, "JMP anotherLine");
});
