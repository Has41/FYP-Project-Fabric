import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import useAuth from "../../hooks/useAuth"
import { useMutation } from "react-query"
import axiosInstance from "../../utils/axiosInstance"
import { FiActivity, FiLogIn, FiLogOut, FiShoppingBag } from "react-icons/fi"

const Navbar = () => {
  const { user, setUser } = useAuth()
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  const { mutate: logout, isLoading: isLoggingOut } = useMutation({
    mutationFn: async () => {
      return await axiosInstance.post("/api/v1/users/logout")
    },
    onSuccess: () => {
      setUser(null)
      setDropdownVisible(false)
      navigate("/auth")
    },
    onError: (error) => {
      console.error("An error occurred while logging out", error)
    }
  })

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev)
  }

  const handleLogoutClick = () => {
    setDropdownVisible(false)
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <nav className="bg-white font-poppins">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="text-2xl font-bold text-gray-800">
          <h1 className="uppercase font-bold">Fabric</h1>
        </div>

        <div className="hidden md:flex space-x-8">
          <ul className="flex space-x-6 text-gray-600">
            <li className="hover:text-custom-text cursor-pointer">Home</li>
            <li className="hover:text-custom-text cursor-pointer">About</li>
            <li className="hover:text-custom-text cursor-pointer">Products</li>
            <li className="hover:text-custom-text cursor-pointer">Contact Us</li>
          </ul>
        </div>

        <div className="flex gap-x-4 relative">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-black/80"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </div>
          <div className="relative">
            <div onClick={toggleDropdown} className="cursor-pointer">
              {user ? (
                user.avatar && user.avatar.length !== 0 ? (
                  <img src={user?.avatar?.url} className="size-8 rounded-full" alt="User Avatar" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-black/80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-black/80"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </div>

            {dropdownVisible && (
              <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg w-36 select-none z-50">
                <ul className="text-gray-600">
                  {user ? (
                    <>
                      {user.role === "designer" && (
                        <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm">
                          <Link to="/design/stats" className="flex items-center gap-2">
                            <FiActivity className="h-4 w-4" />
                            My Designs
                          </Link>
                        </li>
                      )}
                      <li className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm">
                        <Link to="/user/more" className="flex items-center gap-2">
                          <FiShoppingBag className="h-4 w-4" />
                          More Options
                        </Link>
                      </li>
                      <li
                        onClick={handleLogoutClick}
                        className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm flex items-center gap-2"
                      >
                        <FiLogOut className="h-4 w-4" />
                        Logout
                      </li>
                    </>
                  ) : (
                    <li
                      onClick={() => navigate("/auth")}
                      className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm flex items-center gap-2"
                    >
                      <FiLogIn className="h-4 w-4" />
                      Login
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={cancelLogout} />

            {/* Modal */}
            <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition disabled:opacity-50"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </nav>
  )
}

export default Navbar
