/**
 * JVM Class Bytecode Synthesizer for Minecraft Fabric Mod Initializer and Mixins
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
 */
export function generateModInitializerBytecode(
  packageName: string,
  className: string,
  javaVersion: number = 17
): Uint8Array {
  const internalPackage = packageName.replace(/\./g, '/');
  const thisClassPath = `${internalPackage}/${className}`;
  const sourceFileName = `${className}.java`;

  let majorVersion = 61;
  if (javaVersion <= 8) majorVersion = 52;
  else if (javaVersion <= 16) majorVersion = 60;
  else if (javaVersion <= 17) majorVersion = 61;
  else if (javaVersion >= 21) majorVersion = 65;

  const w = new ByteWriter();

  w.u4(0xCAFEBABE);
  w.u2(0);
  w.u2(majorVersion);

  const utf8Encode = (str: string): number[] => {
    const encoder = new TextEncoder();
    const encoded = Array.from(encoder.encode(str));
    return [(encoded.length >> 8) & 0xFF, encoded.length & 0xFF, ...encoded];
  };

  const constantPoolCount = 15;
  w.u2(constantPoolCount);

  // #1 Methodref: class #2, name_and_type #3
  w.u1(10); w.u2(2); w.u2(3);
  // #2 Class: #6
  w.u1(7); w.u2(6);
  // #3 NameAndType: name #7, descriptor #8
  w.u1(12); w.u2(7); w.u2(8);
  // #4 Class: #9
  w.u1(7); w.u2(9);
  // #5 Class: #10
  w.u1(7); w.u2(10);
  // #6 Utf8: "java/lang/Object"
  w.u1(1); w.bytes(utf8Encode("java/lang/Object"));
  // #7 Utf8: "<init>"
  w.u1(1); w.bytes(utf8Encode("<init>"));
  // #8 Utf8: "()V"
  w.u1(1); w.bytes(utf8Encode("()V"));
  // #9 Utf8: "net/fabricmc/api/ModInitializer"
  w.u1(1); w.bytes(utf8Encode("net/fabricmc/api/ModInitializer"));
  // #10 Utf8: thisClassPath
  w.u1(1); w.bytes(utf8Encode(thisClassPath));
  // #11 Utf8: "Code"
  w.u1(1); w.bytes(utf8Encode("Code"));
  // #12 Utf8: "onInitialize"
  w.u1(1); w.bytes(utf8Encode("onInitialize"));
  // #13 Utf8: "SourceFile"
  w.u1(1); w.bytes(utf8Encode("SourceFile"));
  // #14 Utf8: sourceFileName
  w.u1(1); w.bytes(utf8Encode(sourceFileName));

  w.u2(0x0021); // ACC_PUBLIC | ACC_SUPER
  w.u2(5);      // this_class
  w.u2(2);      // super_class
  w.u2(1);      // interfaces_count
  w.u2(4);      // interface #4 (ModInitializer)
  w.u2(0);      // fields_count
  w.u2(2);      // methods_count

  // Method 1: <init>
  w.u2(0x0001); w.u2(7); w.u2(8); w.u2(1);
  w.u2(11); w.u4(17); w.u2(1); w.u2(1); w.u4(5);
  w.u1(0x2A); w.u1(0xB7); w.u2(1); w.u1(0xB1);
  w.u2(0); w.u2(0);

  // Method 2: onInitialize
  w.u2(0x0001); w.u2(12); w.u2(8); w.u2(1);
  w.u2(11); w.u4(13); w.u2(0); w.u2(1); w.u4(1);
  w.u1(0xB1); w.u2(0); w.u2(0);

  // Attributes count: 1 (SourceFile)
  w.u2(1);
  w.u2(13); w.u4(2); w.u2(14);

  return w.toUint8Array();
}

/**
 * Generates a valid JVM .class file for a Fabric Mixin class
 */
export function generateMixinClassBytecode(
  packageName: string,
  mixinName: string,
  javaVersion: number = 17
): Uint8Array {
  const internalPackage = packageName.replace(/\./g, '/');
  const thisClassPath = `${internalPackage}/mixin/${mixinName}`;
  const sourceFileName = `${mixinName}.java`;

  let majorVersion = 61;
  if (javaVersion <= 8) majorVersion = 52;
  else if (javaVersion <= 16) majorVersion = 60;
  else if (javaVersion <= 17) majorVersion = 61;
  else if (javaVersion >= 21) majorVersion = 65;

  const w = new ByteWriter();

  w.u4(0xCAFEBABE);
  w.u2(0);
  w.u2(majorVersion);

  const utf8Encode = (str: string): number[] => {
    const encoder = new TextEncoder();
    const encoded = Array.from(encoder.encode(str));
    return [(encoded.length >> 8) & 0xFF, encoded.length & 0xFF, ...encoded];
  };

  const constantPoolCount = 13;
  w.u2(constantPoolCount);

  // #1 Methodref: class #2, name_and_type #3
  w.u1(10); w.u2(2); w.u2(3);
  // #2 Class: #5
  w.u1(7); w.u2(5);
  // #3 NameAndType: name #6, descriptor #7
  w.u1(12); w.u2(6); w.u2(7);
  // #4 Class: #8
  w.u1(7); w.u2(8);
  // #5 Utf8: "java/lang/Object"
  w.u1(1); w.bytes(utf8Encode("java/lang/Object"));
  // #6 Utf8: "<init>"
  w.u1(1); w.bytes(utf8Encode("<init>"));
  // #7 Utf8: "()V"
  w.u1(1); w.bytes(utf8Encode("()V"));
  // #8 Utf8: thisClassPath
  w.u1(1); w.bytes(utf8Encode(thisClassPath));
  // #9 Utf8: "Code"
  w.u1(1); w.bytes(utf8Encode("Code"));
  // #10 Utf8: "SourceFile"
  w.u1(1); w.bytes(utf8Encode("SourceFile"));
  // #11 Utf8: sourceFileName
  w.u1(1); w.bytes(utf8Encode(sourceFileName));
  // #12 (reserved or unused filler)
  w.u1(1); w.bytes(utf8Encode("mixin"));

  w.u2(0x0021); // ACC_PUBLIC | ACC_SUPER
  w.u2(4);      // this_class (#4)
  w.u2(2);      // super_class (#2 - java/lang/Object)
  w.u2(0);      // interfaces_count
  w.u2(0);      // fields_count
  w.u2(1);      // methods_count (<init>)

  // Method 1: <init>
  w.u2(0x0001); w.u2(6); w.u2(7); w.u2(1);
  w.u2(9); w.u4(17); w.u2(1); w.u2(1); w.u4(5);
  w.u1(0x2A); w.u1(0xB7); w.u2(1); w.u1(0xB1);
  w.u2(0); w.u2(0);

  // Attributes count: 1 (SourceFile)
  w.u2(1);
  w.u2(10); w.u4(2); w.u2(11);

  return w.toUint8Array();
}
