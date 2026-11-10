import type { LocationSnapshot } from './types';

export class NavigationHistory {
  private back: LocationSnapshot[] = [];
  private forward: LocationSnapshot[] = [];

  record(origin: LocationSnapshot): void {
    this.back.push(origin);
    if (this.back.length > 100) this.back.shift();
    this.forward = [];
  }

  peek(direction: 'back' | 'forward'): LocationSnapshot | undefined {
    return (direction === 'back' ? this.back : this.forward).at(-1);
  }

  move(direction: 'back' | 'forward', origin: LocationSnapshot): LocationSnapshot | undefined {
    const from = direction === 'back' ? this.back : this.forward;
    const into = direction === 'back' ? this.forward : this.back;
    const target = from.pop();
    if (target) into.push(origin);
    return target;
  }

  get state(): { back: boolean; forward: boolean } {
    return { back: !!this.back.length, forward: !!this.forward.length };
  }
}
