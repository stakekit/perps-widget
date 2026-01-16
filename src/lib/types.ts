import { Data } from "effect";

export type StableRef<T> = { _tag: "StableRef"; data: T };

export const makeStableRef = <T>(data: T) =>
  Data.tagged<StableRef<T>>("StableRef")({ data });
