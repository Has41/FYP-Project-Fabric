import React from "react"

const AvatarSection = ({ avatar, setAvatar, register }) => {
  return (
    <>
      <div className="mb-6 flex items-center justify-center">
        <div className="w-52 h-52 rounded-full overflow-none border-2 border-slate-200">
          {avatar ? (
            <img src={URL.createObjectURL(avatar)} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center m-auto h-full text-sm text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="avatar" className="block text-gray-700 font-medium mb-2 cursor-pointer">
          <div className="bg-slate-50 rounded-md py-2 px-4 flex items-center justify-between">
            <span className="text-sm">Choose an avatar</span>
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
    </>
  )
}

export default AvatarSection
