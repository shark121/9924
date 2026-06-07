// Minimal ambient types for Node's built-in `node:sqlite` module.
// The runtime (Node 24) ships it, but @types/node@20 predates it. Covers only
// the surface used by lib/orders-db.ts.
declare module "node:sqlite" {
  type SupportedValue = null | number | bigint | string | Uint8Array;

  interface StatementSync {
    run(...params: SupportedValue[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: SupportedValue[]): Record<string, SupportedValue> | undefined;
    all(...params: SupportedValue[]): Record<string, SupportedValue>[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
