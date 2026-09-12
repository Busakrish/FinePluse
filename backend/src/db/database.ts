import fs from 'fs';
import path from 'path';
import {
  User,
  CustomerProfile,
  Account,
  Transaction,
  Loan,
  LoanPayment,
  FinancialGoal,
  Consent,
  FinancialTwin,
  AIInsight,
  Recommendation,
  Product,
  FraudAlert,
  StressAlert,
  ChatSession,
  ChatMessage,
  WhatIfSimulation,
  Notification,
  AuditLog,
} from './types.js';

export interface DatabaseSchema {
  users: User[];
  customer_profiles: CustomerProfile[];
  accounts: Account[];
  transactions: Transaction[];
  loans: Loan[];
  loan_payments: LoanPayment[];
  financial_goals: FinancialGoal[];
  consents: Consent[];
  financial_twins: FinancialTwin[];
  ai_insights: AIInsight[];
  recommendations: Recommendation[];
  products: Product[];
  fraud_alerts: FraudAlert[];
  stress_alerts: StressAlert[];
  chat_sessions: ChatSession[];
  chat_messages: ChatMessage[];
  what_if_simulations: WhatIfSimulation[];
  notifications: Notification[];
  audit_logs: AuditLog[];
}

const DB_FILE = path.join(process.cwd(), 'finpulse_data.json');

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private getInitialData(): DatabaseSchema {
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

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing empty schema:', err);
    }
    const initial = this.getInitialData();
    this.saveDatabase(initial);
    return initial;
  }

  public saveDatabase(state?: DatabaseSchema): void {
    const toSave = state || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public resetDatabase(freshData: DatabaseSchema): void {
    this.data = freshData;
    this.saveDatabase();
  }

  // --- Generic Typed Table Accessors ---

  public getTable<K extends keyof DatabaseSchema>(tableName: K): DatabaseSchema[K] {
    return this.data[tableName];
  }

  public findById<K extends keyof DatabaseSchema>(
    tableName: K,
    id: string
  ): DatabaseSchema[K][number] | undefined {
    return (this.data[tableName] as any[]).find((item: any) => item.id === id);
  }

  public findOne<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K][number] | undefined {
    return (this.data[tableName] as any[]).find(predicate);
  }

  public filter<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K] {
    return (this.data[tableName] as any[]).filter(predicate) as DatabaseSchema[K];
  }

  public insert<K extends keyof DatabaseSchema>(
    tableName: K,
    record: DatabaseSchema[K][number]
  ): DatabaseSchema[K][number] {
    (this.data[tableName] as any[]).push(record);
    this.saveDatabase();
    return record;
  }

  public update<K extends keyof DatabaseSchema>(
    tableName: K,
    id: string,
    updates: Partial<DatabaseSchema[K][number]>
  ): DatabaseSchema[K][number] | undefined {
    const list = this.data[tableName] as any[];
    const index = list.findIndex((item) => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
      this.saveDatabase();
      return list[index];
    }
    return undefined;
  }

  public updateWhere<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate: (item: DatabaseSchema[K][number]) => boolean,
    updates: Partial<DatabaseSchema[K][number]>
  ): number {
    const list = this.data[tableName] as any[];
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

  public delete<K extends keyof DatabaseSchema>(tableName: K, id: string): boolean {
    const list = this.data[tableName] as any[];
    const initialLen = list.length;
    this.data[tableName] = list.filter((item) => item.id !== id) as any;
    if (this.data[tableName].length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const fullLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.insert('audit_logs', fullLog);
    return fullLog;
  }
}

export const db = new DatabaseManager();
