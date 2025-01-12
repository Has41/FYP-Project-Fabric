import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "react-query"
import AuthProvider from "./context/AuthContext.jsx"
import App from "./App.jsx"
import "./index.css"
import { ProductProvider } from "./context/ProductContext.jsx"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProductProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ProductProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
