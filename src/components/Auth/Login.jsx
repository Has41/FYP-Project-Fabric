import React from "react"
import { loginFields } from "../../utils/dynamicData"
import { useForm } from "react-hook-form"
import useFetch from "../../hooks/useFetch"

const Login = ({ onRegisterClick }) => {
  const { register: login, handleSubmit, reset } = useForm()

  const { mutate } = useFetch({
    endpoint: "/api/v1/users/login",
    method: "POST"
  })

  const onSubmit = (data) => {
    mutate(data)
    reset()
  }

  return (
    <div className="flex items-center justify-center h-full font-poppins">
      <div className="shadow-lg w-[450px] h-[480px] py-8 px-4 bg-white rounded-tl-lg rounded-bl-lg tracking-wide">
        <div>
          <h3 className="text-[1.6rem] ml-4 font-bold text-black/80 relative after:content-[''] after:w-[2rem] after:block after:h-1 after:rounded-2xl after:bg-dusty-grass after:absolute after:left-4 after:transform after:-translate-x-1/2 after:-bottom-1">
            Login
          </h3>
          <p className="ml-4 text-black/80 mt-6">Please login to your account!</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="select-none" action="">
          <div className="flex flex-col mt-5">
            {loginFields.map((field) => (
              <div
                key={field.id}
                className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border"
              >
                <input
                  className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                  {...login(field.id, { required: true })}
                  type={field.type}
                  placeholder=" "
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 ml-2 w-5 h-5 text-gray-500 absolute left-0 top-3 peer-focus:text-custom-text"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={field.iconPath} />
                </svg>

                <label
                  className="absolute text-sm left-9 top-2 transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-6 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                  htmlFor={field.id}
                >
                  {field.label}
                </label>
              </div>
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
                className="bg-dusty-grass rounded-[4px] w-full text-lg font-semibold tracking-wider py-2 text-white flex items-center justify-center"
                type="submit"
              >
                <span>Login</span>
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
