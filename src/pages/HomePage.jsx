import React from "react"
import Navbar from "../components/Home/Navbar"
import HeroSection from "../components/Home/HeroSection"
import FeaturedProducts from "../components/Home/FeaturedProducts"
import Footer from "../components/Home/Footer"

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <Footer />
    </div>
  )
}

export default HomePage
