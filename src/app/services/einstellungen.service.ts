import { Injectable } from '@angular/core';
import { Preferences } from '@openhps/capacitor-preferences';

@Injectable({
  providedIn: 'root'
})
export class EinstellungenService {
  async setString(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async getString(key: string, fallback: string | null = null): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value ?? fallback;
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setString(key, String(value));
  }

  async getBoolean(key: string, fallback: boolean | null = null): Promise<boolean | null> {
    const value = await this.getString(key);

    if (value === null) {
      return fallback;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return fallback;
  }

  async setNumber(key: string, value: number): Promise<void> {
    await this.setString(key, String(value));
  }

  async getNumber(key: string, fallback: number | null = null): Promise<number | null> {
    const value = await this.getString(key);

    if (value === null) {
      return fallback;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setString(key, JSON.stringify(value));
  }

  async getObject<T>(key: string, fallback: T | null = null): Promise<T | null> {
    const value = await this.getString(key);

    if (value === null) {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  async hasKey(key: string): Promise<boolean> {
    const { keys } = await Preferences.keys();
    return keys.includes(key);
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
