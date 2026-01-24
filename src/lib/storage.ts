import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (!key) {
      return null;
    }
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (!key) {
      return;
    }
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  },

  async remove(key: string): Promise<void> {
    if (!key) {
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
    }
  },
};
