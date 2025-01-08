import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import EditPage from "./pages/EditPage"
import HomePage from "./pages/HomePage"
import ProtectedRoute from "./components/Shared/ProtectedRoute"
import AuthWrapper from "./components/Shared/AuthWrapper"
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
          path="/edit"
          element={
            <ProtectedRoute>
              <EditPage />
            </ProtectedRoute>
          }
        />
        <Route index element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
