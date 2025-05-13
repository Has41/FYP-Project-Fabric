import Navbar from "../components/Home/Navbar"
import HeroSection from "../components/Home/HeroSection"
import FeaturedProducts from "../components/Home/FeaturedProducts"
import Footer from "../components/Home/Footer"
import FeaturedByDesigners from "../components/Home/FeaturedByDesigners"

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <FeaturedByDesigners />
      <Footer />
    </div>
  )
}

export default HomePage
