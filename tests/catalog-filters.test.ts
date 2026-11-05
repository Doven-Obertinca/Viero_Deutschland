import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildCatalog,
  matches,
  productFacets,
  type CatalogItem,
} from "../lib/catalog/filters";
import type { Product } from "../lib/shopware/types";
const product = (id: string, more: Partial<Product> = {}): Product => ({
  id,
  productNumber: id,
  name: "Material",
  ...more,
});
test("normalizes paint attributes without guessing product suitability", () => {
  const facets = productFacets(
    product("1", {
      options: [
        { id: "gold", name: "Gold", group: { name: "Farbton | Allure" } },
        { id: "size", name: "1 l", group: { name: "Einheit" } },
      ],
    }),
  );
  assert.deepEqual(facets, { Farbton: ["Gold"], Gebindegröße: ["1 l"] });
});
test("groups variants and uses actual purchasable variant starting prices", () => {
  const items = buildCatalog([
    product("parent", { calculatedPrice: { unitPrice: 100 } }),
    product("a", {
      parentId: "parent",
      calculatedPrice: { unitPrice: 40 },
      available: true,
    }),
    product("b", { parentId: "parent", calculatedPrice: { unitPrice: 60 } }),
  ]);
  assert.equal(items.length, 1);
  assert.equal(items[0].price, 40);
  assert.equal(items[0].available, true);
  assert.equal(items[0].fromPrice, true);
});
const variant = (colour: string, size: string, price: number): CatalogItem => ({
  id: colour,
  name: "Allure",
  href: "/",
  alt: "",
  subtitle: "",
  price,
  available: true,
  facets: { Farbton: [colour], Gebindegröße: [size] },
});
test("requires colour, size and price to match the same variant", () => {
  const item: CatalogItem = {
    ...variant("Gold", "1 l", 40),
    variants: [variant("Gold", "1 l", 40), variant("Silber", "4 l", 120)],
  };
  assert.equal(
    matches(item, { Farbton: ["Gold"], Gebindegröße: ["4 l"] }, "", "", false),
    false,
  );
  assert.equal(
    matches(
      item,
      { Farbton: ["Gold", "Silber"], Gebindegröße: ["4 l"] },
      "",
      "100:200",
      true,
    ),
    true,
  );
  assert.equal(
    matches(item, { Farbton: ["Gold"] }, "", "100:200", false),
    false,
  );
  assert.equal(
    matches(
      item,
      { Farbton: ["Gold"], Gebindegröße: ["4 l"] },
      "",
      "",
      false,
      "Farbton",
    ),
    true,
  );
});
test("price boundaries, search and unknown stock remain truthful", () => {
  const item = variant("Gold", "1 l", 50);
  assert.equal(matches(item, {}, " gold ", "0:50", false), false);
  assert.equal(matches(item, {}, " gold ", "50:100", true), true);
  assert.equal(
    matches({ ...item, available: undefined }, {}, "", "", true),
    false,
  );
  assert.equal(
    matches({ ...item, price: undefined }, {}, "", "0:50", false),
    false,
  );
});

test("application filters distinguish floor systems from wall finishes and tools", () => {
  const items = buildCatalog([
    product("floor", { name: "Oltre" }),
    product("wall", { name: "Ghibli" }),
    product("tool", { name: "Bodenkelle" }),
    product("hydro", { name: "Marmorin Hydro" }),
    product("exterior", { name: "Marmorin Extra" }),
  ]);
  assert.deepEqual(
    items
      .filter((item) => matches(item, { Fläche: ["Boden"] }, "", "", false))
      .map((item) => item.id),
    ["floor"],
  );
  assert.deepEqual(
    items
      .filter((item) =>
        matches(item, { Zimmer: ["Badezimmer"] }, "", "", false),
      )
      .map((item) => item.id),
    ["floor", "hydro"],
  );
  assert.equal(
    matches(
      items[1],
      { Zimmer: ["Wohnzimmer"], Fläche: ["Wand"] },
      "",
      "",
      false,
    ),
    true,
  );
  assert.equal(
    matches(
      items[4],
      { Einsatzbereich: ["Außenbereich"], Fläche: ["Fassade"] },
      "",
      "",
      false,
    ),
    true,
  );
  assert.deepEqual(items[2].facets, {});
});

test("parent application guidance is inherited by size and colour variants", () => {
  const [item] = buildCatalog([
    product("parent", { name: "Oltre" }),
    product("variant", {
      parentId: "parent",
      name: "Oltre - 5 kg",
      calculatedPrice: { unitPrice: 80 },
      options: [{ id: "size", name: "5 kg", group: { name: "Einheit" } }],
    }),
  ]);
  assert.equal(
    matches(
      item,
      { Zimmer: ["Küche"], Fläche: ["Boden"], Gebindegröße: ["5 kg"] },
      "",
      "50:100",
      false,
    ),
    true,
  );
  assert.equal(
    matches(item, { Einsatzbereich: ["Außenbereich"] }, "", "", false),
    false,
  );
});
