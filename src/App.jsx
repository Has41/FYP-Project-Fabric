import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import EditPage from "./pages/EditPage"
import HomePage from "./pages/HomePage"

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route index element={<EditPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
