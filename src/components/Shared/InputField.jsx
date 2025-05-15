import { useEffect, useState } from "react"

const InputField = ({ field, register, error, clearErrors, recalculateFormHeight, setTrigger }) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    clearErrors(field.name)
    setIsFocused(true)
  }

  const handleBlur = async () => {
    setIsFocused(false)
    await setTrigger(field.name)
  }

  useEffect(() => {
    if (isFocused || error) {
      recalculateFormHeight()
    }
  }, [isFocused, error])

  return (
    <>
      <div
        key={field.name}
        className={`ml-4 relative rounded-[4px] max-w-[90%] ${
          error ? "mb-1 border-red-500" : "mb-6 border-gray-300"
        } border-[1px] focus-within:border-custom-border`}
      >
        <input
          className={`px-3 h-11 w-[85%] peer ml-6 text-gray-700 focus:outline-none focus:ring-0 ${
            error ? "border-red-500" : "border-gray-300"
          }}`}
          {...register(field.name, { required: true })}
          type={field.type}
          placeholder=" "
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`size-6 ml-2 w-5 h-5 ${
            error ? "text-red-400" : "text-gray-500"
          } absolute left-0 top-3 peer-focus:text-custom-text`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={field.iconPath || field.svgPath} />
        </svg>

        <label
          className={`absolute text-sm left-9 top-2 transition-all duration-300 ease-out transform scale-90 -translate-y-5 px-1 text-gray-600 peer-placeholder-shown:top-3 peer-placeholder-shown:left-9 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 ${
            error ? "peer-placeholder-shown:text-red-400" : "peer-placeholder-shown:text-gray-400"
          } peer-focus:-translate-y-6 peer-focus:z-[50] peer-focus:scale-90 peer-focus:text-custom-text pointer-events-none bg-white peer-focus:px-2 z-[50]`}
          htmlFor={field.name}
        >
          {field.label}
        </label>
      </div>

      {error && <p className="text-red-500 text-sm ml-4 pt-1 mb-3">{error?.message}</p>}
    </>
  )
}

export default InputField
