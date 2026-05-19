import { useEffect, useState } from "react";
import {NavLink, useLocation} from "react-router";
import { onSessionChange, readSession, type AuthSession } from "../auth.ts";
import { BrandLogo } from "./BrandLogo.tsx";

const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Courses', to: '/courses' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contacts' },
];

export const Navigation = () => {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<AuthSession | null>(() => readSession());

    useEffect(() => {
        setCurrentUser(readSession());
    }, [location.pathname]);

    useEffect(() => {
        return onSessionChange(() => setCurrentUser(readSession()));
    }, []);

    return (
        <nav className="top-nav">
            <NavLink className="brand" to={'/'}>
                <BrandLogo compact />
            </NavLink>
            <div className="nav-right">
                <div className={
                    currentUser?.role === 'admin'
                        ? 'nav-user-status admin-user'
                        : currentUser
                            ? 'nav-user-status'
                            : 'nav-user-status muted'
                }>
                    <span className={currentUser?.role === 'admin' ? 'status-dot admin' : 'status-dot'} />
                    {currentUser ? (
                        <>
                            <span>Влязъл: <strong>{currentUser.username}</strong></span>
                            <em>{currentUser.role === 'admin' ? 'Админ' : 'Клиент'}</em>
                        </>
                    ) : (
                        <span>Не сте влезли</span>
                    )}
                </div>
                <div className="nav-links">
                    {navItems.map((item) => (
                        <NavLink
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            end={item.to === '/'}
                            key={item.to}
                            to={item.to}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
}
