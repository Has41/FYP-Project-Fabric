import EditPage from "./pages/EditPage"
import { Route, Routes } from "react-router-dom"
import Register from "./components/Register"

const App = () => {
  return (
    <>
      <Routes>
        {/* <Route index element={<EditPage />} /> */}
        <Route index element={<Register />} />
      </Routes>
    </>
  )
}

export default App
