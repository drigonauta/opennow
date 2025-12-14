import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize LowDB
const adapter = new JSONFile(path.join(__dirname, 'db.json'));
const db = new Low(adapter, { business: [], subscriptions: [], transactions: [] });

// Ensure defaults
await db.read();
db.data ||= { business: [], subscriptions: [], transactions: [], votes: [] };
await db.write();

const ID_FIELDS = {
    business: 'business_id',
    transactions: 'transaction_id',
    subscriptions: 'subscription_id',
    users: 'id' // Guessing
};

class CollectionReference {
    constructor(name) {
        this.name = name;
        this.filters = [];
        this.limitVal = null;
        this.orderByVal = null;
    }

    doc(id) {
        return new DocumentReference(this.name, id);
    }

    where(field, op, value) {
        this.filters.push({ field, op, value });
        return this;
    }

    limit(n) {
        this.limitVal = n;
        return this;
    }

    orderBy(field, dir) {
        this.orderByVal = { field, dir };
        return this;
    }

    async get() {
        await db.read();
        let data = db.data[this.name] || [];

        // Apply filters
        for (const filter of this.filters) {
            if (filter.op === '==') {
                data = data.filter(item => item[filter.field] === filter.value);
            }
        }

        // Apply OrderBy
        if (this.orderByVal) {
            data.sort((a, b) => {
                const valA = a[this.orderByVal.field];
                const valB = b[this.orderByVal.field];
                if (this.orderByVal.dir === 'desc') return valB - valA;
                return valA - valB;
            });
        }

        // Apply Limit
        if (this.limitVal) {
            data = data.slice(0, this.limitVal);
        }

        const docs = data.map(item => {
            const idField = ID_FIELDS[this.name] || 'id';
            return {
                id: item[idField],
                data: () => item,
                ref: new DocumentReference(this.name, item[idField])
            };
        });

        return {
            empty: data.length === 0,
            docs: docs,
            size: docs.length,
            forEach: (callback) => docs.forEach(callback)
        };
    }
    async add(data) {
        await db.read();
        const collection = db.data[this.name] || [];
        const idField = ID_FIELDS[this.name] || 'id';

        // Generate random ID if not present (simple mock)
        const newId = Math.random().toString(36).substring(2, 15);
        const dataWithId = { ...data, [idField]: newId };

        collection.push(dataWithId);
        db.data[this.name] = collection;
        await db.write();

        return new DocumentReference(this.name, newId);
    }
}

class DocumentReference {
    constructor(collectionName, id) {
        this.collectionName = collectionName;
        this.id = id;
    }

    getIdField() {
        return ID_FIELDS[this.collectionName] || 'id';
    }

    async set(data) {
        await db.read();
        const collection = db.data[this.collectionName] || [];
        const idField = this.getIdField();
        const index = collection.findIndex(item => item[idField] === this.id);

        // Ensure ID is in data
        const dataWithId = { ...data, [idField]: this.id };

        if (index > -1) {
            collection[index] = dataWithId;
        } else {
            collection.push(dataWithId);
        }
        db.data[this.collectionName] = collection;
        await db.write();
    }

    async get() {
        await db.read();
        const collection = db.data[this.collectionName] || [];
        const idField = this.getIdField();
        const item = collection.find(item => item[idField] === this.id);

        return {
            exists: !!item,
            data: () => item,
            ref: this
        };
    }

    async update(data) {
        await db.read();
        const collection = db.data[this.collectionName] || [];
        const idField = this.getIdField();
        const index = collection.findIndex(item => item[idField] === this.id);

        if (index > -1) {
            collection[index] = { ...collection[index], ...data };
            db.data[this.collectionName] = collection;
            await db.write();
        } else {
            // Firestore update fails if doc doesn't exist, but for mock we can ignore or throw
            console.warn(`Document ${this.id} not found in ${this.collectionName} for update`);
        }
    }

    async delete() {
        await db.read();
        const collection = db.data[this.collectionName] || [];
        const idField = this.getIdField();
        const index = collection.findIndex(item => item[idField] === this.id);

        if (index > -1) {
            collection.splice(index, 1);
            db.data[this.collectionName] = collection;
            await db.write();
        } else {
            console.warn(`Document ${this.id} not found in ${this.collectionName} for delete`);
        }
    }
}

export const mockDb = {
    collection: (name) => new CollectionReference(name),
    batch: () => {
        const operations = [];
        return {
            set: (ref, data) => operations.push(() => ref.set(data)),
            update: (ref, data) => operations.push(() => ref.update(data)),
            delete: (ref) => operations.push(() => ref.delete()),
            commit: async () => {
                for (const op of operations) {
                    await op();
                }
            }
        };
    }
};
