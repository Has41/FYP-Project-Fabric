import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema } from "../../utils/zodSchema"
import { stepOneRegisterField, stepTwoRegisterField } from "../../utils/dynamicData"
import InputField from "../Shared/InputField"
import AvatarSection from "../Shared/AvatarSection"
import LoadingSpinner from "../Shared/LoadingSpinner"
import { useMutation } from "react-query"
import axiosInstance from "../../utils/axiosInstance"

const Register = ({ onLoginClick, setFormHeight }) => {
  const [step, setStep] = useState(1)
  const [avatar, setAvatar] = useState(null)
  const registerRef = useRef(null)
  const {
    register,
    reset,
    clearErrors,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const recalculateFormHeight = () => {
    setFormHeight(registerRef.current?.clientHeight)
  }

  const nextStep = async () => {
    // pick which fields to validate
    const fieldsToCheck = step === 1 ? stepOneRegisterField.map((f) => f.name) : stepTwoRegisterField.map((f) => f.name)

    // run validation
    const isValid = await trigger(fieldsToCheck)
    if (!isValid) {
      setFormHeight(registerRef.current.clientHeight)
      return
    }

    // if we just validated step 2, grab those values
    if (step === 2) {
      const step2Values = getValues(fieldsToCheck)
      console.log("Step 2 values:", step2Values)
    }

    // go to the next step
    setFormHeight(registerRef.current.clientHeight)
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const { mutate, isLoading } = useMutation({
    mutationFn: async (formData) => {
      const { data } = await axiosInstance.post("/api/v1/users/register", formData)
      return data
    },
    onSuccess: () => {
      // navigate("/auth")
      window.location.reload()
    },
    onError: () => {
      console.error("An error occurred while registering")
      reset()
    }
  })

  const onSubmit = async (data) => {
    const formData = new FormData()

    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }

    if (avatar) {
      formData.append("avatar", avatar)
    }

    console.log("🔍 Final FormData being sent to server:")
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File] ${value.name}, type: ${value.type}, size: ${value.size} bytes`)
      } else {
        console.log(`${key}:`, value)
      }
    }

    mutate(formData)
  }

  return (
    <div className="flex items-center justify-center h-full font-poppins select-none">
      <div
        ref={registerRef}
        className="shadow-lg w-[450px] min-h-[32rem] py-8 px-4 bg-white rounded-tr-lg rounded-br-lg tracking-wide"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[1.6rem] ml-4 font-bold text-black/80 relative after:content-[''] after:w-[2rem] after:block after:h-1 after:rounded-2xl after:bg-dusty-grass after:absolute after:left-4 after:transform after:-translate-x-1/2 after:-bottom-1">
              Register
            </h3>
          </div>
          {step === 3 && (
            <div className="ml-4 flex items-center justify-between max-w-[90%] mt-2">
              <button
                className="bg-dusty-grass rounded-[4px] flex items-center justify-center w-full font-semibold tracking-wider py-2 px-3 text-white mr-2"
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
            className={`
              transition-opacity duration-500 ease-in-out transform
              ${step === 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"}
              ${step === 1 ? "" : "hidden"}
              w-full
            `}
          >
            <div className="flex flex-col mt-10">
              {stepOneRegisterField.map((field) => (
                <InputField
                  key={field.name}
                  field={field}
                  error={errors[field.name]}
                  clearErrors={clearErrors}
                  setTrigger={trigger}
                  register={register}
                  recalculateFormHeight={recalculateFormHeight}
                />
              ))}
              <div className="ml-4 flex justify-start max-w-[90%] mt-2">
                <button
                  className="bg-dusty-grass rounded w-full text-lg font-semibold tracking-wider py-2 text-white flex items-center justify-center"
                  type="button"
                  onClick={nextStep}
                >
                  Next <span className="ml-2">→</span>
                </button>
              </div>
              <div className="mx-auto mt-5 text-sm text-black/80">
                Already have an account?{" "}
                <span onClick={onLoginClick} className="ml-1 cursor-pointer">
                  Login now!
                </span>
              </div>
            </div>
          </div>

          <div
            className={`
              transition-opacity duration-500 ease-in-out transform
              ${step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
              ${step === 2 ? "" : "hidden"}
              w-full
            `}
          >
            <div className="flex flex-col mt-10">
              {stepTwoRegisterField.map((field) => (
                <InputField
                  key={field.name}
                  field={field}
                  error={errors[field.name]}
                  clearErrors={clearErrors}
                  setTrigger={trigger}
                  register={register}
                  recalculateFormHeight={recalculateFormHeight}
                />
              ))}

              <div className="ml-4">
                <p className="text-sm font-medium mb-2">Select your role:</p>
                <label className="inline-flex items-center mr-6">
                  <input
                    type="radio"
                    {...register("role")}
                    value="user"
                    defaultChecked
                    className="form-radio size-4 accent-black"
                  />
                  <span className="ml-2">User</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" {...register("role")} value="designer" className="form-radio h-4 w-4 accent-black" />
                  <span className="ml-2">Designer</span>
                </label>
                {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
              </div>

              <div className="ml-4 flex items-center justify-between max-w-[90%] mt-2 gap-x-4">
                <button
                  className="bg-dusty-grass rounded w-1/2 font-semibold py-2 text-white flex items-center justify-center"
                  type="button"
                  onClick={prevStep}
                >
                  ← Back
                </button>
                <button
                  className="bg-dusty-grass rounded w-1/2 font-semibold py-2 text-white flex items-center justify-center"
                  type="button"
                  onClick={nextStep}
                >
                  Next <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`transition-opacity duration-1000 ease-in-out transform ${
              step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
            } flex items-center justify-center w-full h-full`}
          >
            <div className={`px-4 mt-4 w-full ${step !== 3 ? "hidden" : ""}`}>
              <h3 className="mb-4 ml-2 text-black/80">Would you like to upload?</h3>
              <AvatarSection avatar={avatar} setAvatar={setAvatar} register={register} />
              <div className="flex flex-col items-center justify-between max-w-[95%] mt-4 gap-y-4">
                <button
                  className={`${
                    isLoading ? "bg-dusty-grass cursor-not-allowed" : "bg-dusty-grass hover:bg-amber-500 hover:transition-colors"
                  } rounded-[4px] flex items-center justify-center w-full font-semibold tracking-wider py-2 text-white ml-2`}
                  type="submit"
                >
                  <LoadingSpinner loading={isLoading} loadingText={"Submitting"} finalText={"Register"} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
