import { useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "react-query"
import { editSchema } from "../../utils/zodSchema"
import { editFormFields } from "../../utils/dynamicData"
import axiosInstance from "../../utils/axiosInstance"
import InputField from "../Shared/InputField"
import LoadingSpinner from "../Shared/LoadingSpinner"
import useAuth from "../../hooks/useAuth"

const EditForm = () => {
  const { user, refetch } = useAuth()
  const formRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullname: user?.fullname || "",
      username: user?.username || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      country: user?.country || "",
      address: user?.address || "",
      city: user?.city || "",
      postalCode: user.postalCode || ""
    },
    shouldUnregister: false
  })

  const { mutate, isLoading } = useMutation((formData) => axiosInstance.patch(`/api/v1/users/update-details`, formData), {
    onSuccess: async () => {
      await refetch()
      window.location.reload()
    },
    onError: () => console.error("Update failed")
  })

  const onSubmit = (data) => {
    // Remove empty values
    const cleanedData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined && v !== null))

    mutate(cleanedData)
  }

  return (
    <div className="flex items-center justify-center h-full font-poppins select-none">
      <div
        ref={formRef}
        className="shadow-lg w-[450px] min-h-[32rem] py-8 px-4 bg-white rounded-tr-lg rounded-br-lg tracking-wide"
      >
        <h3 className="text-[1.6rem] ml-4 font-bold text-black/80 relative after:content-[''] after:w-[2rem] after:block after:h-1 after:rounded-2xl after:bg-dusty-grass after:absolute after:left-4 after:transform after:-translate-x-1/2 after:-bottom-1">
          Edit Profile
        </h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col mt-10">
            {editFormFields.map((field) => (
              <InputField
                key={field.name}
                field={field}
                register={register}
                error={errors[field.name]}
                clearErrors={() => {}}
                setTrigger={() => {}}
                recalculateFormHeight={() => {}}
              />
            ))}
            <div className="mt-6">
              <button
                type="submit"
                className={`${
                  isLoading ? "bg-dusty-grass cursor-not-allowed" : "bg-dusty-grass hover:bg-amber-500 hover:transition-colors"
                } rounded-[4px] w-full flex items-center justify-center font-semibold tracking-wider py-2 text-white`}
              >
                <LoadingSpinner loading={isLoading} loadingText={"Updating"} finalText={"Save"} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditForm
