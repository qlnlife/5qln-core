// ═══════════════════════════════════════════════════════════════
// @5qln/core — Storage
//
// Pluggable persistence interface with in-memory reference
// implementation. The interface is the contract. The implementation
// is replaceable.
// ═══════════════════════════════════════════════════════════════

import {
  type StorageInterface,
  type Residue,
  type ProvenanceRecord,
} from './types.js';

export class MemoryStorage implements StorageInterface {
  private _store: Map<string, Residue> = new Map();

  async saveResidue(residue: Residue): Promise<void> {
    this._store.set(residue.id, residue);
  }

  async loadAllResidue(): Promise<Residue[]> {
    return [...this._store.values()];
  }

  async loadResidue(id: string): Promise<Residue | null> {
    return this._store.get(id) ?? null;
  }

  async updateResidue(id: string, patch: Partial<Residue>): Promise<void> {
    const existing = this._store.get(id);
    if (!existing) throw new Error(`Residue not found: ${id}`);
    this._store.set(id, { ...existing, ...patch } as Residue);
  }

  async deleteResidue(id: string): Promise<void> {
    this._store.delete(id);
  }

  async clearAll(): Promise<void> {
    this._store.clear();
  }

  resolveProvenance(hash: string): ProvenanceRecord | null {
    for (const residue of this._store.values()) {
      if (residue.provenance?.provenance_hash === hash) {
        return residue.provenance;
      }
    }
    return null;
  }
}
