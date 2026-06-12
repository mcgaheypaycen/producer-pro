const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Simple JSON-file-backed store. Each collection (performers, venues, acts,
 * shows) is an array of objects with string ids. Data volume for this app is
 * small, so a single JSON file with atomic writes is reliable and portable.
 */
class Store {
  constructor(dataDir) {
    this.dataDir = dataDir;
    /** @type {string} Absolute path to the JSON store file. */
    this.file = path.join(dataDir, 'producer-pro-data.json');
    this.data = { performers: [], venues: [], acts: [], shows: [] };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        for (const key of Object.keys(this.data)) {
          if (Array.isArray(raw[key])) this.data[key] = raw[key];
        }
      }
    } catch (err) {
      // Corrupt file: keep a backup so user data is never silently destroyed.
      try {
        fs.copyFileSync(this.file, this.file + '.corrupt-' + Date.now());
      } catch (_) {}
    }
  }

  persist() {
    fs.mkdirSync(this.dataDir, { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tmp, this.file);
  }

  list(collection) {
    return this.data[collection] || [];
  }

  get(collection, id) {
    return this.list(collection).find((item) => item.id === id) || null;
  }

  save(collection, item) {
    const items = this.data[collection];
    if (!items) throw new Error('Unknown collection: ' + collection);
    const now = new Date().toISOString();
    if (item.id) {
      const idx = items.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...item, updatedAt: now };
        this.persist();
        return items[idx];
      }
    }
    const saved = {
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    items.push(saved);
    this.persist();
    return saved;
  }

  delete(collection, id) {
    const items = this.data[collection];
    if (!items) throw new Error('Unknown collection: ' + collection);
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }
}

module.exports = { Store };
