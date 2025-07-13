import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "react-query"
import axiosInstance from "../../utils/axiosInstance"

const FeaturedByDesigners = () => {
  const [designs, setDesigns] = useState([])

  useQuery({
    queryKey: ["publicDesigns", { page: 1, limit: 10 }],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/v1/designs/public?page=1&limit=10")
      return data.data
    },
    onSuccess: (data) => {
      console.log(data.docs[0].image.url)

      setDesigns(data.docs)
    },
    onError: (error) => {
      console.error(error)
    }
  })

  return (
    <section className="font-poppins my-4">
      <div className="ml-10 py-10 mb-4">
        <h1 className="text-3xl text-center font-semibold relative after:content-[''] after:w-[200px] after:block after:h-1 after:rounded-2xl after:bg-custom-green after:absolute after:left-1/2 after:transform after:-translate-x-1/2 after:bottom-[-15px]">
          Featured Designs
        </h1>
      </div>
      <div className="grid grid-cols-3 gap-y-4 place-items-center">
        {designs.map((design) => (
          <Link
            key={design._id}
            to={`/view-design/${design._id}`}
            className="bg-white w-[330px] h-[420px] py-4 hover:shadow-md hover:border hover:border-gray-200 transition-all duration-500 cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center gap-y-2">
              <div className="w-full h-64 overflow-hidden">
                {design?.image ? (
                  <img src={design?.image?.url} alt={design.title || "Design preview"} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No Preview</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center mt-4 gap-y-2">
                <h3 className="text-lg font-semibold">{design.name || "Untitled"}</h3>
                {design.owner && (
                  <div className="flex items-center gap-x-2">
                    {design.owner.avatar ? (
                      <img src={design.owner.avatar} alt={design.owner.username} className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full" />
                    )}
                    <span className="text-gray-500 font-mont">{design.owner.username}</span>
                  </div>
                )}
                <p className="text-black/80 font-bold font-mont">${design.salePrice}.00</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default FeaturedByDesigners
