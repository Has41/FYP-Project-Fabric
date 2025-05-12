import { Fragment, useEffect, useRef, useState } from "react"
import { loginFields } from "../../utils/dynamicData"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "../../utils/zodSchema"
import LoadingSpinner from "../Shared/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import { useMutation } from "react-query"
import axiosInstance from "../../utils/axiosInstance"
import useAuth from "../../hooks/useAuth"

const Login = ({ onRegisterClick, setFormHeight }) => {
  const { refetch } = useAuth()
  const [isFocused, setIsFocused] = useState(false)
  const loginRef = useRef(null)
  const navigate = useNavigate()
  const {
    register: login,
    trigger,
    clearErrors,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const handleFocus = (fieldId) => {
    clearErrors(fieldId)
    setIsFocused(true)
  }

  const handleBlur = async (fieldId) => {
    setIsFocused(false)
    await trigger(fieldId)
  }

  const { mutate, error, isLoading } = useMutation({
    mutationFn: async (credentials) => {
      const { data } = await axiosInstance.post("/api/v1/users/login", credentials)
      return data
    },
    onSuccess: async () => {
      console.log("Logged in successfully")
      await refetch()
      navigate("/")
    },
    onError: () => {
      console.error("An error occurred while logging in")
      reset()
    }
  })

  useEffect(() => {
    if (isFocused || error) {
      setFormHeight(loginRef.current?.clientHeight)
    }
  }, [isFocused, error])

  return (
    <div className="flex items-center justify-center h-full font-poppins">
      <div
        ref={loginRef}
        className="shadow-lg w-[450px] min-h-[30rem] py-8 px-4 bg-white rounded-tl-lg rounded-bl-lg tracking-wide"
      >
        <div>
          <h3 className="text-[1.6rem] ml-4 font-bold text-black/80 relative after:content-[''] after:w-[2rem] after:block after:h-1 after:rounded-2xl after:bg-dusty-grass after:absolute after:left-4 after:transform after:-translate-x-1/2 after:-bottom-1">
            Login
          </h3>
          <p className="ml-4 text-black/80 mt-6">
            {error ? <span className="text-red-500">{error?.response?.data?.message}</span> : "Please login to your account!"}
          </p>
        </div>
        <form onSubmit={handleSubmit(mutate)} className="select-none" action="">
          <div className="flex flex-col mt-5">
            {loginFields.map((field) => (
              <Fragment key={field.id}>
                <div
                  className={`ml-4 relative rounded-[4px] max-w-[90%] ${
                    errors[field.id] ? "mb-1 border-red-500" : "mb-6 border-gray-300"
                  } border-[1px] border-gray-300 focus-within:border-custom-border`}
                >
                  <input
                    className={`px-3 h-11 w-[85%] peer ml-6 ${
                      errors[field.id] ? "peer-placeholder-shown:text-red-400" : "peer-placeholder-shown:text-gray-400"
                    } ${isLoading && "cursor-not-allowed"} text-gray-700 focus:outline-none focus:ring-0`}
                    {...login(field.id, { required: true })}
                    type={field.type}
                    onFocus={() => handleFocus(field.id)}
                    onBlur={() => handleBlur(field.id)}
                    disabled={isLoading}
                    placeholder=" "
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-6 ml-2 w-5 h-5 ${
                      errors[field.id] ? "text-red-500" : "text-gray-500"
                    } absolute left-0 top-3 peer-focus:text-custom-text`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={field.iconPath} />
                  </svg>

                  <label
                    className={`absolute text-sm left-9 top-2 transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 ${
                      errors[field.id] ? "peer-placeholder-shown:text-red-400" : "peer-placeholder-shown:text-gray-400"
                    } peer-focus:-translate-y-6 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]`}
                    htmlFor={field.id}
                  >
                    {field.label}
                  </label>
                </div>
                {errors[field.id] && (
                  <p id={`${field.id}-error`} className="text-red-500 text-sm ml-4 pt-1 mb-3">
                    {errors[field.id]?.message}
                  </p>
                )}
              </Fragment>
            ))}

            <div className="flex justify-evenly items-center gap-x-14 my-2">
              <div className="flex items-center gap-x-2">
                <input
                  id="remember"
                  className="rounded-sm lg:text-lg border border-slate-300 active:border active:border-custom-border checked:bg-custom-green focus:border-transparent focus:ring-0"
                  type="checkbox"
                />
                <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div>
                <a href="#" className="text-sm text-gray-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="ml-4 flex justify-start max-w-[90%] mt-5">
              <button
                className={`rounded-[4px] w-full text-lg font-semibold tracking-wider py-2 text-white flex items-center justify-center transition-all duration-300 ${
                  isLoading ? "bg-dusty-grass cursor-not-allowed" : "bg-dusty-grass hover:bg-amber-500 hover:transition-colors"
                }`}
                type="submit"
                disabled={isLoading}
              >
                <LoadingSpinner loading={isLoading} loadingText={"Logging In"} finalText={"Login"} />
              </button>
            </div>
            <div className="mx-auto mt-5 text-sm text-black/80">
              Don't have an account?
              <span onClick={onRegisterClick} className="ml-1 cursor-pointer">
                Sign up now!
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
