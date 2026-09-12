import fs from 'fs';
import path from 'path';
const DB_FILE = path.join(process.cwd(), 'finpulse_data.json');
class DatabaseManager {
    data;
    constructor() {
        this.data = this.loadDatabase();
    }
    getInitialData() {
        return {
            users: [],
            customer_profiles: [],
            accounts: [],
            transactions: [],
            loans: [],
            loan_payments: [],
            financial_goals: [],
            consents: [],
            financial_twins: [],
            ai_insights: [],
            recommendations: [],
            products: [],
            fraud_alerts: [],
            stress_alerts: [],
            chat_sessions: [],
            chat_messages: [],
            what_if_simulations: [],
            notifications: [],
            audit_logs: [],
        };
    }
    loadDatabase() {
        try {
            if (fs.existsSync(DB_FILE)) {
                const raw = fs.readFileSync(DB_FILE, 'utf-8');
                return JSON.parse(raw);
            }
        }
        catch (err) {
            console.warn('Could not read existing database file, initializing empty schema:', err);
        }
        const initial = this.getInitialData();
        this.saveDatabase(initial);
        return initial;
    }
    saveDatabase(state) {
        const toSave = state || this.data;
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to persist database file:', err);
        }
    }
    resetDatabase(freshData) {
        this.data = freshData;
        this.saveDatabase();
    }
    // --- Generic Typed Table Accessors ---
    getTable(tableName) {
        return this.data[tableName];
    }
    findById(tableName, id) {
        return this.data[tableName].find((item) => item.id === id);
    }
    findOne(tableName, predicate) {
        return this.data[tableName].find(predicate);
    }
    filter(tableName, predicate) {
        return this.data[tableName].filter(predicate);
    }
    insert(tableName, record) {
        this.data[tableName].push(record);
        this.saveDatabase();
        return record;
    }
    update(tableName, id, updates) {
        const list = this.data[tableName];
        const index = list.findIndex((item) => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
            this.saveDatabase();
            return list[index];
        }
        return undefined;
    }
    updateWhere(tableName, predicate, updates) {
        const list = this.data[tableName];
        let count = 0;
        for (let i = 0; i < list.length; i++) {
            if (predicate(list[i])) {
                list[i] = { ...list[i], ...updates, updated_at: new Date().toISOString() };
                count++;
            }
        }
        if (count > 0) {
            this.saveDatabase();
        }
        return count;
    }
    delete(tableName, id) {
        const list = this.data[tableName];
        const initialLen = list.length;
        this.data[tableName] = list.filter((item) => item.id !== id);
        if (this.data[tableName].length !== initialLen) {
            this.saveDatabase();
            return true;
        }
        return false;
    }
    logAudit(log) {
        const fullLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            ...log,
        };
        this.insert('audit_logs', fullLog);
        return fullLog;
    }
}
export const db = new DatabaseManager();
