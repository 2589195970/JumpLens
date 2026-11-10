import type { NavigationKind, Position, Target } from './types';

export interface NavigationServer {
  readonly healthy: boolean;
  sync(uri: string, text: string): Promise<void>;
  navigate(uri: string, text: string, position: Position, kind: NavigationKind, signal?: AbortSignal): Promise<Target[]>;
  virtualText(uri: string, signal?: AbortSignal): Promise<string>;
  close(uri: string): Promise<void>;
  dispose(): void;
}
