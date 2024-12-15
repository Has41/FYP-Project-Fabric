import React from "react"
import heroImg from "../../assets/hero2.jpg"

const HeroSection = () => {
  return (
    <section className="w-[95%] h-screen mx-auto flex items-center justify-between rounded-sm gap-x-4 bg-gray-100 my-4 font-poppins">
      <div className="space-y-7 w-6/12 pl-8">
        <div className="text-xl font-semibold text-black/80 uppercase">Upto 25% Off!</div>
        <div className="text-6xl font-bold text-gray-800 leading-snug">Elegant Men's Collection In This Season</div>
        <div>
          <button className="bg-black/80 text-white py-3 px-6 hover:bg-white hover:text-black/80 hover:border hover:border-black/80 rounded-sm transition duration-300">
            See Collection
          </button>
        </div>
      </div>

      <div className="w-6/12 h-full flex justify-center">
        <img src={heroImg} alt="Men Collection" className="w-full h-full object-cover rounded-br-sm rounded-tr-sm" />
      </div>
    </section>
  )
}

export default HeroSection
