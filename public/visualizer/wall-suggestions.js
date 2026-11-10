// Conservative image-based proposal, using an upper-room seed and color
// continuity. Semantic classification is deliberately outside this provider.
self.onmessage = async ({ data }) => {
  try {
    const bitmap = await createImageBitmap(data);
    const width = 96;
    const height = Math.max(
      2,
      Math.min(144, Math.round((width * bitmap.height) / bitmap.width)),
    );
    const context = new OffscreenCanvas(width, height).getContext("2d");
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const pixels = context.getImageData(0, 0, width, height).data;
    const seedX = Math.floor(width / 2),
      seedY = Math.floor(height * 0.28);
    const seed = seedY * width + seedX;
    const visited = new Uint8Array(width * height);
    const queue = [seed];
    visited[seed] = 1;
    for (let index = 0; index < queue.length; index++) {
      const pixel = queue[index],
        x = pixel % width,
        y = Math.floor(pixel / width);
      const neighbors = [];
      if (x > 0) neighbors.push(pixel - 1);
      if (x < width - 1) neighbors.push(pixel + 1);
      if (y > Math.floor(height * 0.09)) neighbors.push(pixel - width);
      if (y < Math.floor(height * 0.76)) neighbors.push(pixel + width);
      for (const next of neighbors) {
        if (visited[next]) continue;
        let distance = 0,
          gradient = 0;
        for (let channel = 0; channel < 3; channel++) {
          distance += Math.abs(
            pixels[next * 4 + channel] - pixels[seed * 4 + channel],
          );
          gradient += Math.abs(
            pixels[next * 4 + channel] - pixels[pixel * 4 + channel],
          );
        }
        if (distance < 70 && gradient < 45) {
          visited[next] = 1;
          queue.push(next);
        }
      }
    }
    if (queue.length < width * height * 0.05) return self.postMessage([]);
    // Emit a coarse editable polygon. Inner gaps and obstructions need manual review.
    const left = [],
      right = [];
    for (let y = 0; y < height; y += 2) {
      const row = visited.subarray(y * width, (y + 1) * width);
      const first = row.indexOf(1),
        last = row.lastIndexOf(1);
      if (last - first < 4) continue;
      left.push([first / width, y / height]);
      right.push([(last + 1) / width, y / height]);
    }
    self.postMessage(left.length > 2 ? [left.concat(right.reverse())] : []);
  } catch {
    self.postMessage(null);
  }
};
