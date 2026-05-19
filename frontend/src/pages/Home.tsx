import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
    clearSession,
    readSession,
    readUsers,
    saveSession,
    saveUsers,
    type AuthSession,
} from '../auth.ts';
import { BrandLogo } from '../components/BrandLogo.tsx';

type AuthMode = 'login' | 'register';

export const Home = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<AuthSession | null>(null);

    useEffect(() => {
        setCurrentUser(readSession());
    }, []);

    const resetForm = () => {
        setUsername('');
        setPassword('');
    };

    const loginUser = () => {
        const normalizedUsername = username.trim();
        if (normalizedUsername.toLowerCase() === 'admin' && password.trim().length > 0) {
            const session: AuthSession = { username: 'admin', role: 'admin' };
            saveSession(session);
            setCurrentUser(session);
            navigate('/admin');
            return;
        }

        const user = readUsers().find((storedUser) => {
            return storedUser.username.toLowerCase() === normalizedUsername.toLowerCase()
                && storedUser.password === password;
        });

        if (!user) {
            setMessage('Невалидно потребителско име или парола. Ако нямате профил, първо се регистрирайте.');
            return;
        }

        const session: AuthSession = { username: user.username, role: user.role };
        saveSession(session);
        setCurrentUser(session);
        navigate(user.role === 'admin' ? '/admin' : '/courses');
    };

    const registerUser = () => {
        const normalizedUsername = username.trim();
        if (normalizedUsername.length < 3 || password.trim().length < 3) {
            setMessage('Потребителското име и паролата трябва да са поне 3 символа.');
            return;
        }
        if (normalizedUsername.toLowerCase() === 'admin') {
            setMessage('Името admin е запазено за административния профил.');
            return;
        }

        const users = readUsers();
        const exists = users.some((user) => user.username.toLowerCase() === normalizedUsername.toLowerCase());
        if (exists) {
            setMessage('Вече има профил с това потребителско име.');
            return;
        }

        saveUsers([...users, { username: normalizedUsername, password, role: 'client' }]);
        setMode('login');
        resetForm();
        setMessage('Регистрацията е успешна. Вече можете да влезете с профила си.');
    };

    const submitAuth = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('');
        if (mode === 'login') {
            loginUser();
            return;
        }
        registerUser();
    };

    const logout = () => {
        clearSession();
        setCurrentUser(null);
        setMode('login');
        setMessage('Излязохте от профила си.');
    };

    return (
        <section className="home-page">
            <div className="home-overlay">
                {currentUser ? (
                    <div className="login-box user-panel">
                        <p className="eyebrow">В момента сте влезли като</p>
                        <h1>{currentUser.username}</h1>
                        <p className="login-note">
                            Роля: {currentUser.role === 'admin' ? 'администратор' : 'клиент'}
                        </p>
                        <button
                            className="primary-action"
                            onClick={() => navigate(currentUser.role === 'admin' ? '/admin' : '/courses')}
                            type="button"
                        >
                            {currentUser.role === 'admin' ? 'Към админ панела' : 'Към клиентската страница'}
                        </button>
                        <button className="ghost-action" onClick={logout} type="button">
                            Изход
                        </button>
                    </div>
                ) : (
                    <form className="login-box" onSubmit={submitAuth}>
                        <p className="eyebrow">Welcome to</p>
                        <h1><BrandLogo className="title-brand" /></h1>
                        <div className="auth-switch">
                            <button
                                className={mode === 'login' ? 'active' : ''}
                                onClick={() => {
                                    setMode('login');
                                    setMessage('');
                                }}
                                type="button"
                            >
                                Вход
                            </button>
                            <button
                                className={mode === 'register' ? 'active' : ''}
                                onClick={() => {
                                    setMode('register');
                                    setMessage('');
                                }}
                                type="button"
                            >
                                Регистрация
                            </button>
                        </div>
                        <label>
                            <span>Username</span>
                            <input
                                autoComplete="username"
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder={mode === 'login' ? 'admin or your username' : 'Choose username'}
                                required
                                value={username}
                            />
                        </label>
                        <label>
                            <span>Password</span>
                            <input
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder={mode === 'login' ? 'Enter password' : 'Create password'}
                                required
                                type="password"
                                value={password}
                            />
                        </label>
                        {message ? <p className="auth-message">{message}</p> : null}
                        <button className="primary-action" type="submit">
                            {mode === 'login' ? 'Вход' : 'Регистрация'}
                        </button>
                        <p className="login-note">
                            Админ достъп: username admin. Клиентските профили се създават от Регистрация.
                        </p>
                    </form>
                )}
            </div>
        </section>
    );
};
