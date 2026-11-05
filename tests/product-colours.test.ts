import test from "node:test";
import assert from "node:assert/strict";
import {
  colourPreview,
  panelInk,
  matchingVariant,
} from "../lib/content/product-colours";
import type { Product } from "../lib/shopware/types";
test("uses source hex first and distinguishes unknown colour codes", () => {
  assert.equal(
    colourPreview({ id: "gold", name: "Gold", colorHexCode: "#123456" }).colour,
    "#123456",
  );
  assert.equal(colourPreview({ id: "gold", name: "Gold" }).approximate, true);
  assert.equal(colourPreview({ id: "mar", name: "MAR42" }).unavailable, true);
  assert.equal(panelInk("#000000"), "#faf9f4");
  assert.equal(panelInk("#ffffff"), "#252724");
});
test("variant price belongs to the full colour and size combination", () => {
  const variants = [
    {
      id: "small",
      productNumber: "S",
      options: [
        { id: "gold", group: { name: "Farbe" } },
        { id: "one", group: { name: "Einheit" } },
      ],
      calculatedPrice: { unitPrice: 20 },
    },
    {
      id: "large",
      productNumber: "L",
      options: [
        { id: "gold", group: { name: "Farbe" } },
        { id: "four", group: { name: "Einheit" } },
      ],
      calculatedPrice: { unitPrice: 70 },
    },
  ] as Product[];
  assert.equal(
    matchingVariant(variants, { Farbe: "gold", Einheit: "four" })
      ?.calculatedPrice?.unitPrice,
    70,
  );
  assert.equal(
    matchingVariant(variants, { Farbe: "silver", Einheit: "four" }),
    undefined,
  );
});
