import React from "react"
import Navbar from "../components/Navbar"
import HeroSection from "../components/HeroSection"
import FeaturedProducts from "../components/FeaturedProducts"
import Footer from "../components/Footer"

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
