import {Navigation} from "./Navigation.tsx";
import {Outlet} from "react-router";

export const Layout = () => {
    return (
        <div className="layout">
            <Navigation />
            <main>
                <Outlet />
            </main>
        </div>
    )
}
