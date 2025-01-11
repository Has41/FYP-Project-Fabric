import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { useMutation } from "react-query"
import axiosInstance from "../../utils/axiosInstance"

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const { isAuthenticated, setIsAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const { mutate } = useMutation({
    mutationFn: async () => {
      return await axiosInstance.post("/api/v1/users/logout")
    },
    onSuccess: () => {
      setDropdownVisible(false)
      setIsAuthenticated(false)
      navigate("/auth")
    },
    onError: (error) => {
      console.error("An error occurred while logging out", error)
    }
  })

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev)
  }

  return (
    <nav className="bg-white font-poppins">
      <div className="container mx-auto flex justify-between items-center py-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <h1 className="uppercase font-bold">Fabric</h1>
        </div>

        {/* Menu Links */}
        <div className="hidden md:flex space-x-8">
          <ul className="flex space-x-6 text-gray-600">
            <li className="hover:text-custom-text cursor-pointer">Home</li>
            <li className="hover:text-custom-text cursor-pointer">About</li>
            <li className="hover:text-custom-text cursor-pointer">Products</li>
            <li className="hover:text-custom-text cursor-pointer">Contact Us</li>
          </ul>
        </div>

        {/* Get Started Button */}
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
            {isAuthenticated && user ? (
              user.avatar && user.avatar.length !== 0 ? (
                <img src={user?.avatar} alt="" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 text-black/80 cursor-pointer"
                  onClick={toggleDropdown}
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
                className="size-6 text-black/80 cursor-pointer"
                onClick={toggleDropdown}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}

            {isAuthenticated ? (
              <>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg w-20">
                    <ul className="text-gray-600">
                      <li onClick={mutate} className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm">
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 bg-white shadow-md rounded-lg w-20">
                    <ul className="text-gray-600">
                      <li
                        onClick={() => navigate("/auth")}
                        className="px-4 py-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm"
                      >
                        Login
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
