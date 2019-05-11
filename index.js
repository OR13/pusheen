const fs = require("fs");

const compiled = new WebAssembly.Module(
  fs.readFileSync(__dirname + "/build/optimized.wasm")
);

const hasBigInt64 = typeof BigUint64Array !== "undefined";
let mem, I8, U8, I16, U16, I32, U32, F32, F64, I64, U64;

const checkMem = () => {
  if (mem !== module.exports.memory.buffer) {
    mem = module.exports.memory.buffer;
    I8 = new Int8Array(mem);
    U8 = new Uint8Array(mem);
    I16 = new Int16Array(mem);
    U16 = new Uint16Array(mem);
    I32 = new Int32Array(mem);
    U32 = new Uint32Array(mem);
    if (hasBigInt64) {
      I64 = new BigInt64Array(mem);
      U64 = new BigUint64Array(mem);
    }
    F32 = new Float32Array(mem);
    F64 = new Float64Array(mem);
  }
};

const getString = ptr => {
  checkMem();
  const dataLength = U32[ptr >>> 2];
  let dataOffset = (ptr + 4) >>> 1;
  let dataRemain = dataLength;
  const parts = [];
  const chunkSize = 1024;
  while (dataRemain > chunkSize) {
    let last = U16[dataOffset + chunkSize - 1];
    let size = last >= 0xd800 && last < 0xdc00 ? chunkSize - 1 : chunkSize;
    let part = U16.subarray(dataOffset, (dataOffset += size));
    parts.push(String.fromCharCode.apply(String, part));
    dataRemain -= size;
  }
  return (
    parts.join("") +
    String.fromCharCode.apply(
      String,
      U16.subarray(dataOffset, dataOffset + dataRemain)
    )
  );
};

const imports = {
  console: {
    log(strPtr) {
      console.log("wasm: " + getString(strPtr));
    }
  }
};

Object.defineProperty(module, "exports", {
  get: () => new WebAssembly.Instance(compiled, imports).exports
});
