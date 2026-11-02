// A binary min-heap: the priority queue the algorithm keeps its waiting orders in.
// Uses nothing. No DOM. The comparator returns a negative number when a comes before b.
// Used by js/engine/algo.js and tools/verify-content.mjs.

export class MinHeap {
  constructor(before) {
    this.before = before;
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(item) {
    const a = this.items;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.before(a[i], a[parent]) >= 0) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }

  pop() {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let first = i;
        if (l < a.length && this.before(a[l], a[first]) < 0) first = l;
        if (r < a.length && this.before(a[r], a[first]) < 0) first = r;
        if (first === i) break;
        [a[i], a[first]] = [a[first], a[i]];
        i = first;
      }
    }
    return top;
  }

  // The items in heap order (index 0 is the root). Used to draw the tree.
  toArray() {
    return [...this.items];
  }
}
