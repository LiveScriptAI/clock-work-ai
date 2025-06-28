
import { getUserId } from '@/utils/userId';

const prefix = `cwp_${getUserId()}_`;

export function save(key: string, data: any): void {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
}

export function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(prefix + key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return null;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(prefix + key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
}

export function clear(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
