import React, { useState } from "react"
import { useForm } from "react-hook-form"
import useFetch from "../hooks/useFetch"

const Register = () => {
  const [step, setStep] = useState(1)
  const [avatar, setAvatar] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const { mutate, isLoading, isError, error } = useFetch({
    endpoint: "/api/v1/users/register",
    method: "POST",
    options: {
      mutationOptions: {
        onSuccess: (data) => {
          console.log("Registration successful:", data)
          reset()
          setStep(1)
        },
        onError: (err) => {
          console.error("Registration failed:", err)
          reset()
          setStep(1)
        }
      }
    }
  })

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()

      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value)
      }

      mutate(formData)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-center h-screen font-poppins">
        <div className="shadow-lg w-[450px] h-[30rem] py-7 px-4 bg-white rounded-lg tracking-wide">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[1.6rem] ml-4 font-bold text-black/80 relative after:content-[''] after:w-[2rem] after:block after:h-1 after:rounded-2xl after:bg-dusty-grass after:absolute after:left-4 after:transform after:-translate-x-1/2 after:-bottom-1">
                Register
              </h3>
            </div>
            {step === 3 && (
              <div className="ml-4 flex items-center justify-between max-w-[90%] mt-2">
                <button
                  className="bg-dusty-grass rounded-[4px] flex items-center justify-center w-full font-semibold tracking-wider py-1 px-3 text-white mr-2"
                  type="button"
                  onClick={prevStep}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>

                  <span>Back</span>
                </button>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className={`transition-opacity duration-500 ease-in-out transform ${
                step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
              } w-full`}
            >
              {step === 1 && (
                <div className="flex flex-col mt-10">
                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("username", { required: true })}
                      type="text"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>

                    <label
                      className="absolute text-sm left-9 top-2 transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Username"
                    >
                      Username
                    </label>
                  </div>

                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("email", { required: true })}
                      type="text"
                      placeholder=" "
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 ml-2 w-5 h-5 text-gray-500 absolute left-0 top-3 peer-focus:text-custom-text"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>

                    <label
                      className="absolute left-9 top-2 text-sm transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Email"
                    >
                      Email
                    </label>
                  </div>

                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("password", { required: true })}
                      type="text"
                      placeholder=" "
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 ml-2 w-5 h-5 text-gray-500 absolute left-0 top-3 peer-focus:text-custom-text"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>

                    <label
                      className="absolute text-sm left-9 top-2 transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Password"
                    >
                      Password
                    </label>
                  </div>

                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      type="text"
                      placeholder=" "
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 ml-2 w-5 h-5 text-gray-500 absolute left-0 top-3 peer-focus:text-custom-text"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    <label
                      className="absolute left-9 top-2 text-sm transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Password"
                    >
                      Confirm Password
                    </label>
                  </div>

                  <div className="ml-4 flex justify-start max-w-[90%] mt-2">
                    <button
                      className="bg-dusty-grass rounded-[4px] w-full text-lg font-semibold tracking-wider py-2 text-white flex items-center justify-center"
                      type="button"
                      onClick={nextStep}
                    >
                      <span>Next</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 ml-2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`transition-opacity duration-500 ease-in-out transform ${
                step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
              } w-full`}
            >
              {step === 2 && (
                <div className="flex flex-col mt-10">
                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("phoneNumber", { required: false })}
                      type="tel"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                      />
                    </svg>
                    <label
                      className="absolute left-9 top-2 text-sm transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Password"
                    >
                      Phone Number
                    </label>
                  </div>

                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("address", { required: true })}
                      type="text"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819"
                      />
                    </svg>

                    <label
                      className="absolute left-9 top-2 text-sm transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Password"
                    >
                      Address
                    </label>
                  </div>

                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("city", { required: true })}
                      type="text"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                      />
                    </svg>

                    <label
                      className="absolute left-9 top-2 text-sm transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Password"
                    >
                      City
                    </label>
                  </div>

                  <div className="ml-4 relative rounded-[4px] max-w-[90%] mb-6 border-[1px] border-gray-300 focus-within:border-custom-border">
                    <input
                      className="px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0"
                      {...register("postalCode", { required: true })}
                      type="text"
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>

                    <label
                      className="absolute left-9 top-2 text-sm transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-5 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]"
                      htmlFor="Password"
                    >
                      Postal Code
                    </label>
                  </div>
                  <div className="ml-4 flex items-center justify-between max-w-[90%] mt-2">
                    <button
                      className="bg-dusty-grass rounded-[4px] flex items-center justify-center w-1/2 text-lg font-semibold tracking-wider py-2 text-white mr-2"
                      type="button"
                      onClick={prevStep}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                      </svg>

                      <span>Back</span>
                    </button>
                    <button
                      className="bg-dusty-grass rounded-[4px] flex items-center justify-center w-1/2 text-lg font-semibold tracking-wider py-2 text-white ml-2"
                      type="button"
                      onClick={nextStep}
                    >
                      <span>Next</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 ml-2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`transition-opacity duration-500 ease-in-out transform ${
                step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
              } flex items-center justify-center w-full h-full`}
            >
              <div className="px-4 mt-4 w-full max-w-md">
                <h3 className="mb-4 ml-2 text-black/80">Would you like to upload an avatar?</h3>
                <div className="mb-6 flex items-center justify-center">
                  <div
                    className={`w-52 h-52 rounded-full overflow-hidden 
                      border-2 border-slate-200`}
                  >
                    {avatar && (
                      <img src={URL.createObjectURL(avatar)} alt="Avatar Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="avatar" className="block text-gray-700 font-medium mb-2 cursor-pointer">
                    <div className="bg-slate-50 rounded-md py-2 px-4 flex items-center justify-between">
                      <span>Choose an avatar</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-500 size-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    {...register("avatar")}
                    type="file"
                    id="avatar"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0]
                      if (selectedFile) {
                        setAvatar(selectedFile)
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col items-center justify-between max-w-[95%] mt-4 gap-y-4">
                  <button
                    className="bg-dusty-grass rounded-[4px] flex items-center justify-center w-full font-semibold tracking-wider py-2 text-white ml-2"
                    type="submit"
                  >
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Register
