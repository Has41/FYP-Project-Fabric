import EditPage from "./pages/EditPage"
import { Route, Routes } from "react-router-dom"

const App = () => {
  return (
    <>
      <Routes>
        <Route index element={<EditPage />} />
      </Routes>
    </>
  )
}

export default App
