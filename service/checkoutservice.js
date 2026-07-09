/**
 * Deep Freeze Utility: Ensures complete immutability of event payloads
 */
const deepFreeze = (obj) => {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
};

class OrderAggregate {
  // ... constructor stays the same ...

  async load(eventStream) {
    const snapshot = await this.snapshotStore.load(this.id);
    // Snapshot Integrity Check
    if (snapshot && snapshot.aggregateId === this.id && snapshot.version <= this.version) {
       this.state = snapshot.data;
       this.version = snapshot.version;
    }

    // Event Store assumed ordered; Removed sort for O(n) performance
    for (const rawEvent of eventStream.filter(e => e.aggregateVersion > this.version)) {
      const event = this.upcaster.migrate(deepFreeze({ ...rawEvent }));
      await this.apply(event);
    }
  }

  async apply(event) {
    this.validate(event);
    if (event.aggregateVersion !== this.version + 1) throw new Error('Sequence break');
    
    this.state = { ...this.state, ...event.payload };
    this.version = event.aggregateVersion;

    // Snapshotting is now delegated to the Persistence Layer 
    // to ensure it only occurs after EventStore commit.
  }
}
