import type { NavigationKind, Position, Target } from './types';
import type { SemanticSpan } from './semantic';

export interface NavigationServer {
  readonly healthy: boolean;
  sync(uri: string, text: string): Promise<void>;
  navigate(uri: string, text: string, position: Position, kind: NavigationKind, signal?: AbortSignal): Promise<Target[]>;
  virtualText(uri: string, signal?: AbortSignal): Promise<string>;
  close(uri: string): Promise<void>;
  semanticTokens?(uri: string, text: string, signal?: AbortSignal): Promise<SemanticSpan[]>;
  dispose(): void;
}
