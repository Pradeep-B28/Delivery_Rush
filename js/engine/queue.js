// A first-in, first-out queue with O(1) add and remove.
// Uses nothing. No DOM.
// Used by js/engine/sim.js (rider jobs) and js/engine/bfs.js (the search frontier).

export class Queue {
  constructor(items = []) {
    this.items = [...items];
    this.head = 0;
  }

  push(item) {
    this.items.push(item);
  }

  // Removes and returns the oldest item, or undefined when empty.
  shift() {
    if (this.size === 0) return undefined;
    return this.items[this.head++];
  }

  peek() {
    return this.items[this.head];
  }

  get size() {
    return this.items.length - this.head;
  }

  toArray() {
    return this.items.slice(this.head);
  }
}
