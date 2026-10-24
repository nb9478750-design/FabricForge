/**
 * JVM Class Bytecode Synthesizer for Minecraft Fabric Mod Initializer
 * Generates valid binary .class files conforming to the JVM Class File specification.
 */

class ByteWriter {
  private buffer: number[] = [];

  u1(value: number) {
    this.buffer.push(value & 0xFF);
  }

  u2(value: number) {
    this.buffer.push((value >> 8) & 0xFF);
    this.buffer.push(value & 0xFF);
  }

  u4(value: number) {
    this.buffer.push((value >> 24) & 0xFF);
    this.buffer.push((value >> 16) & 0xFF);
    this.buffer.push((value >> 8) & 0xFF);
    this.buffer.push(value & 0xFF);
  }

  bytes(arr: number[] | Uint8Array) {
    for (let i = 0; i < arr.length; i++) {
      this.buffer.push(arr[i]);
    }
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generates a valid JVM .class file for a Fabric ModInitializer
 * @param packageName e.g. "net.fabricmc.example"
 * @param className e.g. "ExampleMod"
 * @param javaVersion target Java version (8, 16, 17, 21)
 */
export function generateModInitializerBytecode(
  packageName: string,
  className: string,
  javaVersion: number = 17
): Uint8Array {
  const internalPackage = packageName.replace(/\./g, '/');
  const thisClassPath = `${internalPackage}/${className}`;
  const sourceFileName = `${className}.java`;

  // Java major version mappings:
  // Java 8 = 52 (0x34)
  // Java 16 = 60 (0x3C)
  // Java 17 = 61 (0x3D)
  // Java 21 = 65 (0x41)
  let majorVersion = 61;
  if (javaVersion <= 8) majorVersion = 52;
  else if (javaVersion <= 16) majorVersion = 60;
  else if (javaVersion <= 17) majorVersion = 61;
  else if (javaVersion >= 21) majorVersion = 65;

  const w = new ByteWriter();

  // 1. Magic
  w.u4(0xCAFEBABE);
  // 2. Minor version
  w.u2(0);
  // 3. Major version
  w.u2(majorVersion);

  // Constant Pool definitions:
  // 1: Methodref -> class: #2 (Object), name_and_type: #3 (<init>:()V)
  // 2: Class -> #6 ("java/lang/Object")
  // 3: NameAndType -> name: #7 ("<init>"), descriptor: #8 ("()V")
  // 4: Class -> #9 ("net/fabricmc/api/ModInitializer")
  // 5: Class -> #10 (thisClassPath)
  // 6: Utf8 -> "java/lang/Object"
  // 7: Utf8 -> "<init>"
  // 8: Utf8 -> "()V"
  // 9: Utf8 -> "net/fabricmc/api/ModInitializer"
  // 10: Utf8 -> thisClassPath
  // 11: Utf8 -> "Code"
  // 12: Utf8 -> "onInitialize"
  // 13: Utf8 -> "SourceFile"
  // 14: Utf8 -> sourceFileName

  const utf8Encode = (str: string): number[] => {
    const encoder = new TextEncoder();
    const encoded = Array.from(encoder.encode(str));
    return [(encoded.length >> 8) & 0xFF, encoded.length & 0xFF, ...encoded];
  };

  const constantPoolCount = 15; // 1 to 14
  w.u2(constantPoolCount);

  // #1 Methodref: class #2, name_and_type #3
  w.u1(10); // CONSTANT_Methodref
  w.u2(2);
  w.u2(3);

  // #2 Class: #6
  w.u1(7); // CONSTANT_Class
  w.u2(6);

  // #3 NameAndType: name #7, descriptor #8
  w.u1(12); // CONSTANT_NameAndType
  w.u2(7);
  w.u2(8);

  // #4 Class: #9
  w.u1(7); // CONSTANT_Class
  w.u2(9);

  // #5 Class: #10
  w.u1(7); // CONSTANT_Class
  w.u2(10);

  // #6 Utf8: "java/lang/Object"
  w.u1(1);
  w.bytes(utf8Encode("java/lang/Object"));

  // #7 Utf8: "<init>"
  w.u1(1);
  w.bytes(utf8Encode("<init>"));

  // #8 Utf8: "()V"
  w.u1(1);
  w.bytes(utf8Encode("()V"));

  // #9 Utf8: "net/fabricmc/api/ModInitializer"
  w.u1(1);
  w.bytes(utf8Encode("net/fabricmc/api/ModInitializer"));

  // #10 Utf8: thisClassPath
  w.u1(1);
  w.bytes(utf8Encode(thisClassPath));

  // #11 Utf8: "Code"
  w.u1(1);
  w.bytes(utf8Encode("Code"));

  // #12 Utf8: "onInitialize"
  w.u1(1);
  w.bytes(utf8Encode("onInitialize"));

  // #13 Utf8: "SourceFile"
  w.u1(1);
  w.bytes(utf8Encode("SourceFile"));

  // #14 Utf8: sourceFileName
  w.u1(1);
  w.bytes(utf8Encode(sourceFileName));

  // Access flags: ACC_PUBLIC (0x0001) | ACC_SUPER (0x0020)
  w.u2(0x0021);

  // This class: #5
  w.u2(5);

  // Super class: #2 (java/lang/Object)
  w.u2(2);

  // Interfaces count: 1 (net/fabricmc/api/ModInitializer)
  w.u2(1);
  w.u2(4);

  // Fields count: 0
  w.u2(0);

  // Methods count: 2 (<init> and onInitialize)
  w.u2(2);

  // Method 1: public <init>()V
  {
    w.u2(0x0001); // ACC_PUBLIC
    w.u2(7);      // name: <init>
    w.u2(8);      // descriptor: ()V
    w.u2(1);      // attributes count: 1 (Code)

    // Code attribute:
    w.u2(11); // attribute_name_index: "Code"
    // attribute_length: 2 (max_stack) + 2 (max_locals) + 4 (code_len) + 5 (code) + 2 (exception_table_length) + 2 (attributes_count) = 17
    w.u4(17);
    w.u2(1); // max_stack = 1
    w.u2(1); // max_locals = 1
    w.u4(5); // code_length = 5
    // Code instructions:
    // 0: aload_0 (0x2A)
    // 1: invokespecial #1 (0xB7, 0x00, 0x01)
    // 4: return (0xB1)
    w.u1(0x2A);
    w.u1(0xB7);
    w.u2(1);
    w.u1(0xB1);
    w.u2(0); // exception_table_length = 0
    w.u2(0); // attributes_count = 0
  }

  // Method 2: public onInitialize()V
  {
    w.u2(0x0001); // ACC_PUBLIC
    w.u2(12);     // name: onInitialize
    w.u2(8);      // descriptor: ()V
    w.u2(1);      // attributes count: 1 (Code)

    // Code attribute:
    w.u2(11); // attribute_name_index: "Code"
    // attribute_length: 2 + 2 + 4 + 1 + 2 + 2 = 13
    w.u4(13);
    w.u2(0); // max_stack = 0
    w.u2(1); // max_locals = 1
    w.u4(1); // code_length = 1
    // Code instructions:
    // 0: return (0xB1)
    w.u1(0xB1);
    w.u2(0); // exception_table_length = 0
    w.u2(0); // attributes_count = 0
  }

  // Class Attributes count: 1 (SourceFile)
  w.u2(1);
  w.u2(13); // attribute_name_index: "SourceFile"
  w.u4(2);  // attribute_length = 2
  w.u2(14); // sourcefile_index: #14

  return w.toUint8Array();
}
