import { expect, it } from "@jest/globals";
import { nextPond, POND_IDS } from "./ponds";

it.each(POND_IDS)("always hops from %s to one of the other two ponds", current => {
  const destinations = [nextPond(current, 0), nextPond(current, .999)];
  expect(new Set(destinations)).toEqual(new Set(POND_IDS.filter(pond => pond !== current)));
});
