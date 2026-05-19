export type UserRole = 'admin' | 'client';

export interface StoredUser {
    username: string;
    password: string;
    role: UserRole;
}

export interface AuthSession {
    username: string;
    role: UserRole;
}

const usersKey = 'polyglot-users';
const sessionKey = 'polyglot-current-user';
const sessionChangedEvent = 'polyglot-session-changed';

const parseStoredValue = <T>(value: string | null, fallback: T): T => {
    if (!value) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
};

export const readUsers = (): StoredUser[] => {
    return parseStoredValue<StoredUser[]>(localStorage.getItem(usersKey), []);
};

export const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem(usersKey, JSON.stringify(users));
};

export const readSession = (): AuthSession | null => {
    return parseStoredValue<AuthSession | null>(localStorage.getItem(sessionKey), null);
};

export const saveSession = (session: AuthSession) => {
    localStorage.setItem(sessionKey, JSON.stringify(session));
    window.dispatchEvent(new Event(sessionChangedEvent));
};

export const clearSession = () => {
    localStorage.removeItem(sessionKey);
    window.dispatchEvent(new Event(sessionChangedEvent));
};

export const onSessionChange = (handler: () => void) => {
    const storageHandler = (event: StorageEvent) => {
        if (event.key === sessionKey) {
            handler();
        }
    };

    window.addEventListener(sessionChangedEvent, handler);
    window.addEventListener('storage', storageHandler);

    return () => {
        window.removeEventListener(sessionChangedEvent, handler);
        window.removeEventListener('storage', storageHandler);
    };
};
