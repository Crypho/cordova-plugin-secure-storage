declare namespace Crypho {
  class SecureStorage {
    constructor(success: () => void, fail: (error: Error) => void, namespaceName: string);

    set(success: (key: string) => void, fail: (error: Error) => void, key: string, value: string): void;
    get(success: (value: string) => void, fail: (error: Error) => void, key: string): void;
    remove(success: (key: string) => void, fail: (error: Error) => void, key: string): void;
    keys(success: (keys: string[]) => void, fail: (error: Error) => void): void;
    clear(success: () => void, fail: (error: Error) => void): void;
  }
}

interface CordovaPlugins {
  SecureStorage: Crypho.SecureStorage;
}
