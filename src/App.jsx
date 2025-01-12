import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import EditPage from "./pages/EditPage"
import HomePage from "./pages/HomePage"
import ProtectedRoute from "./components/Shared/ProtectedRoute"
import AuthWrapper from "./components/Shared/AuthWrapper"
import ProductPage from "./pages/ProductPage"
import "./App.css"

const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthWrapper>
              <AuthPage />
            </AuthWrapper>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route index element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
