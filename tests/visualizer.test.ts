import { mapVisualizerMaterials } from "../lib/visualizer/catalog-mapping";
import { productSchema } from "../lib/shopware/types";

import assert from "node:assert/strict";
import test from "node:test";
import { inversePlane, project } from "../lib/visualizer/geometry";
import { commit, history, redo, undo } from "../lib/visualizer/history";
import { imageFormat } from "../lib/visualizer/image";
import { rooms, type Point, type Quad } from "../lib/visualizer/model";

test("wall projection maps the four photographed corners into texture coordinates", () => {
  const plane: Quad = [
    [0.1, 0.1],
    [0.85, 0.24],
    [0.82, 0.73],
    [0.03, 0.89],
  ];
  const transform = inversePlane(plane)!;
  const expected: Point[] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  plane.forEach((corner, index) => {
    const [u, v] = project(transform, corner);
    assert.ok(Math.abs(u - expected[index][0]) < 1e-9);
    assert.ok(Math.abs(v - expected[index][1]) < 1e-9);
  });
  assert.equal(
    inversePlane([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]),
    null,
  );
});

test("independent wall assignments survive serialization and history", () => {
  const room = rooms[0];
  const original = history(room.walls);
  const first = commit(
    original,
    original.present.map((wall, index) =>
      index === 0 ? { ...wall, material: "study-sand" } : wall,
    ),
  );
  const second = commit(
    first,
    first.present.map((wall, index) =>
      index === 1 ? { ...wall, material: "study-slate" } : wall,
    ),
  );
  assert.deepEqual(
    second.present.map((wall) => wall.material),
    ["study-sand", "study-slate"],
  );
  assert.deepEqual(undo(second).present, first.present);
  assert.deepEqual(redo(undo(second)).present, second.present);
  assert.deepEqual(
    JSON.parse(JSON.stringify({ ...room, walls: second.present })).walls,
    second.present,
  );
  assert.equal(original.present[0].material, undefined);
});

test("image validation checks signatures instead of filenames", () => {
  assert.equal(imageFormat(Uint8Array.from([255, 216, 255])), "jpeg");
  assert.equal(
    imageFormat(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "png",
  );
  assert.equal(imageFormat(Buffer.from("RIFF0000WEBP")), "webp");
  assert.equal(imageFormat(Buffer.from("0000ftypheic")), "heic");
  assert.equal(imageFormat(Buffer.from("<svg onload=x>")), null);
});

test("the Shopware adapter lists decorative variants without approving catalog photos", () => {
  const product = productSchema.parse({
    id: "019091e09a637242bb7b12f6316a7b08",
    productNumber: "FIXTURE",
    translated: { name: "Allure", description: "<p>Metallic-Finish</p>" },
    categories: [{ id: "019091b56cc87f79ae89fafdfb77fa2a" }],
    options: [
      {
        id: "fixture-color",
        name: "Silber",
        group: { name: "Farbton | Allure" },
      },
    ],
  });
  const unrelated = { ...product, id: "tool", categories: [] };
  const result = mapVisualizerMaterials([unrelated, product]);
  assert.equal(result.length, 1);
  assert.equal(result[0].href, `/produkt/${product.id}`);
  assert.equal(result[0].color, "Silber");
  assert.equal(result[0].description, "Metallic-Finish");
  assert.equal(result[0].texture, undefined);
});
