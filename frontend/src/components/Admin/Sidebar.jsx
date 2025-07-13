import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { createPortal } from "react-dom"
import { useMutation } from "react-query"
import axiosInstance from "../../utils/axiosInstance"
import { useNavigate } from "react-router-dom"
import { FiLogOut } from "react-icons/fi"
import LoadingSpinner from "../Shared/LoadingSpinner"
import useAuth from "../../hooks/useAuth"

const Sidebar = () => {
  const location = useLocation()
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const logoutMutation = useMutation(
    async () => {
      await axiosInstance.post("/api/v1/users/logout")
    },
    {
      onSuccess: () => {
        setUser(null)
        navigate("/auth")
      }
    }
  )

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 9.75L12 3l9 6.75v10.5a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 20.25V9.75z"
          />
        </svg>
      )
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 0115 0"
          />
        </svg>
      )
    },
    {
      name: "Patterns",
      path: "/admin/pattern",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 5h6M11 12h6M11 19h6M5 5h.01M5 12h.01M5 19h.01"
          />
        </svg>
      )
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20.25 14.25V19.5a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75v-5.25M21 9.75H3m18 0l-1.5-6h-13L3 9.75"
          />
        </svg>
      )
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v4H3V3zm0 7h18v4H3v-4zm0 7h18v4H3v-4z" />
        </svg>
      )
    },
    {
      name: "Edit Profile",
      path: "/admin/edit",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h18v4H3V3zm0 7h18v4H3v-4zm0 7h18v4H3v-4z" />
        </svg>
      )
    }
  ]

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logoutMutation.mutate()
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 shadow-lg font-poppins">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="space-y-4 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 p-2 rounded transition ${
              location.pathname === item.path ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button onClick={handleLogout} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition mt-auto">
        <FiLogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutModal &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancelLogout} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-sm w-full z-10">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelLogout}
                  disabled={logoutMutation.isLoading}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={logoutMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition disabled:opacity-50"
                >
                  <LoadingSpinner loading={logoutMutation.isLoading} loadingText="Logging out..." finalText="Logout" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </aside>
  )
}

export default Sidebar
