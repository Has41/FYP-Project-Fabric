import { Route, Routes } from "react-router-dom"
// import AuthPage from "./pages/AuthPage"
// import EditPage from "./pages/EditPage"
import HomePage from "./pages/HomePage"

const App = () => {
  return (
    <>
      <Routes>
        {/* <Route index element={<AuthPage />} /> */}
        {/* <Route index element={<EditPage />} /> */}
        <Route index element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
