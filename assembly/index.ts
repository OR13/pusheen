// The entry file of your WebAssembly module.
import "allocator/arena";

import { BigInt } from "@graphprotocol/graph-ts";

namespace console {
  @external("console", "log")
  export declare function log(s: string): void;
}

export function add(a: i32, b: i32): i32 {
  // let a1 = BigInt.fromI32(a);
  // console.log("adding.." + a1.toString());
  // let b1 = BigInt.fromI32(b);
  return a + b;
}
