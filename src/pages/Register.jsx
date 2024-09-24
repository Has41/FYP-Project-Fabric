import React, { useState } from "react"
import { useForm } from "react-hook-form"
import useFetch from "../hooks/useFetch"

const Register = () => {
  const [step, setStep] = useState(1)
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
      console.log(formData)

      mutate(formData)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <section>
      <div>
        <div>
          <h3>Register</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div>
                <input {...register("fullname", { required: true })} type="text" placeholder="Full Name" />
                <input {...register("username", { required: true })} type="text" placeholder="Username" />
                <input {...register("email", { required: true })} type="email" placeholder="Email" />
                <input {...register("password", { required: true })} type="password" placeholder="Password" />
                <button type="button" onClick={nextStep}>
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <input {...register("phoneNumber", { required: true })} type="tel" placeholder="Phone Number" />
                <input {...register("address", { required: true })} type="text" placeholder="Address" />
                <input {...register("city", { required: true })} type="text" placeholder="City" />
                <input {...register("postalCode", { required: true })} type="text" placeholder="Postal Code" />
                <button type="button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" onClick={nextStep}>
                  Next
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <p>Would you like to upload an avatar?</p>
                <input {...register("avatar")} type="file" name="avatar" />
                <button type="button" onClick={prevStep}>
                  Back
                </button>
                <button type="submit">Skip and Submit</button>
                <button type="submit">Submit with Avatar</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Register
