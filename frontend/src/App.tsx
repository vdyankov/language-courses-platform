import {BrowserRouter, Route, Routes} from "react-router";
import {About, ClientPortal, Contact, Home, NotFound, Platform} from "./pages";
import {Layout} from "./components";

const App = () => {
    return (
      <BrowserRouter>
        <Routes>
            <Route element={<Layout />}>
                <Route path={'/'} element={<Home/>} />
                <Route path={'/courses'} element={<ClientPortal/>} />
                <Route path={'/about'} element={<About/>} />
                <Route path={'/contacts'} element={<Contact/>} />
                <Route path={'/contact'} element={<Contact/>} />
                <Route path={'/admin'} element={<Platform/>} />
                <Route path={'/client'} element={<ClientPortal/>} />
                <Route path={'/*'} element={<NotFound/>} />
            </Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App
