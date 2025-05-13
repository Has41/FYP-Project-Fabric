import { Route, Routes } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import EditPage from "./pages/EditPage"
import HomePage from "./pages/HomePage"
import ProtectedRoute from "./components/Shared/ProtectedRoute"
import AuthWrapper from "./components/Shared/AuthWrapper"
import ProductPage from "./pages/ProductPage"
import "./App.css"
import Dashboard from "./components/Admin/PanelOptions/Dashboard"
import AdminLayout from "./pages/AdminLayout"
import CategoryDetails from "./components/Admin/PanelOptions/CategoryDetails"
import UserDetails from "./components/Admin/PanelOptions/UserDetails"
import PatternDetails from "./components/Admin/PanelOptions/PatternDetails"
import ProductDetails from "./components/Admin/PanelOptions/ProductDetails"
import OrderDetails from "./components/Admin/PanelOptions/OrderDetails"
import AdminRoutes from "./components/Shared/AdminRoutes"
import UserOrders from "./components/Home/UserOptions/UserOrders"
import DesignerStats from "./components/Home/DesignerOptions/DesignerStats"

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
        <Route
          index
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoutes>
              <AdminLayout />
            </AdminRoutes>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<CategoryDetails />} />
          <Route path="users" element={<UserDetails />} />
          <Route path="pattern" element={<PatternDetails />} />
          <Route path="products" element={<ProductDetails />} />
          <Route path="orders" element={<OrderDetails />} />
        </Route>
        <Route path="/user/orders" element={<UserOrders />} />
        <Route path="/design/stats" element={<DesignerStats />} />
      </Routes>
    </>
  )
}

export default App
