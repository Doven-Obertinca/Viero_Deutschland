import { test } from "node:test";
import assert from "node:assert/strict";
import { getShowcaseMotion } from "../lib/home/showcase-motion";

function close(actual: number, expected: number, tolerance = 0.001) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} differs from measured ${expected}`,
  );
}

test("gallery matches stationary rendered measurements of the reference timeline", () => {
  close(getShowcaseMotion(0.15).centerScale, 1.3301);
  const middle = getShowcaseMotion(0.4);
  close(middle.centerScale, 1.125);
  close(450 + middle.portrait * 200, 548, 1);
  close(middle.sides[1].opacity, 0.5781);
  close(middle.sides[1].shift, -33.75);
  close(middle.sides[4].opacity, 0.2297);
  assert.equal(middle.sides[0].opacity, 0);
  const later = getShowcaseMotion(0.6);
  close(later.centerScale, 1.0313);
  close(450 + later.portrait * 200, 624, 1);
  close(later.sides[0].opacity, 0.7037);
  close(later.sides[2].opacity, 0.4213);
  close(later.sides[4].opacity, 0.875);
  const end = getShowcaseMotion(0.9);
  close(end.sides[2].opacity, 0.991);
  close(end.sides[2].shift, -1.0851, 0.01);
});

test("fast jumps and reverse scrolling preserve deterministic complete states", () => {
  const start = getShowcaseMotion(-10);
  assert.equal(start.centerScale, 0.9);
  assert.equal(start.centerOpacity, 0);
  assert.equal(start.portrait, 0);
  assert.ok(start.sides.every((s) => s.opacity === 0));
  const complete = getShowcaseMotion(10);
  assert.equal(complete.centerScale, 1);
  assert.equal(complete.portrait, 1);
  assert.ok(complete.sides.every((s) => s.opacity === 1 && s.shift === 0));
  getShowcaseMotion(1);
  assert.deepEqual(getShowcaseMotion(-1), start);
});

test("opening card zooms and fades in before joining the reference timeline", () => {
  const hidden = getShowcaseMotion(-0.55);
  const entering = getShowcaseMotion(-0.275);
  const joined = getShowcaseMotion(0);
  assert.equal(hidden.centerOpacity, 0);
  assert.equal(hidden.centerScale, 0.9);
  assert.ok(entering.centerOpacity > 0 && entering.centerOpacity < 1);
  assert.ok(
    entering.centerScale > hidden.centerScale &&
      entering.centerScale < joined.centerScale,
  );
  assert.equal(joined.centerOpacity, 1);
  assert.equal(joined.centerScale, 1.5);
  assert.equal(joined.portrait, 0);
  assert.ok(entering.sides.every((side) => side.opacity === 0));
});
