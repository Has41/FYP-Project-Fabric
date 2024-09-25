import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"

const App = () => {
  return (
    <>
      <Routes>
        {/* <Route index element={<EditPage />} /> */}
        <Route index element={<AuthPage />} />
      </Routes>
    </>
  )
}

export default App
