import React, { useState, useRef, useEffect } from "react"
import Login from "../components/Auth/Login"
import Register from "../components/Auth/Register"
import bgImage from "../assets/bg.jpeg"
import gsap from "gsap"

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const loginRef = useRef(null)
  const registerRef = useRef(null)
  const imageRef = useRef(null)
  const titleRef = useRef(null)
  const subTitle = useRef(null)

  const handleSwitchToLogin = () => {
    const timeLine = gsap.timeline()

    timeLine
      .to(registerRef.current, { opacity: 0, scale: 0.95, duration: 0.7 })
      .to([titleRef.current, subTitle.current], { opacity: 0, scale: 0.95, duration: 0.7 })
      .call(() => setIsLogin(true))
      .set(registerRef.current, { display: "none" })
      .set(loginRef.current, { display: "block" })
      .to(loginRef.current, { opacity: 1, scale: 1, duration: 0.7 })
      .to([titleRef.current, subTitle.current], { opacity: 1, scale: 1, duration: 0.7 })

    timeLine.play()
  }

  const handleSwitchToRegister = () => {
    const timeLine = gsap.timeline()

    timeLine
      .to(loginRef.current, { opacity: 0, scale: 0.95, duration: 0.7 })
      .to([titleRef.current, subTitle.current], { opacity: 0, scale: 0.95, duration: 0.7 })
      .call(() => setIsLogin(false))
      .set(loginRef.current, { display: "none" })
      .set(registerRef.current, { display: "block" })
      .to(registerRef.current, { opacity: 1, scale: 1, duration: 0.7 })
      .to([titleRef.current, subTitle.current], { opacity: 1, scale: 1, duration: 0.7 })

    timeLine.play()
  }

  useEffect(() => {
    console.log(isLogin)
  }, [isLogin])

  return (
    <section className="flex items-center justify-center h-screen">
      <div className={`${isLogin ? "" : "hidden"}`} ref={loginRef}>
        <Login onRegisterClick={handleSwitchToRegister} />
      </div>
      <div
        ref={imageRef}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        className={`relative select-none shadow-lg w-[450px] ${
          !isLogin ? "h-[520px]" : "h-[480px]"
        } font-poppins py-8 px-4 bg-white ${
          !isLogin ? "rounded-tl-lg rounded-bl-lg" : "rounded-tr-lg rounded-br-lg"
        } tracking-wide`}
      >
        <div
          className={`absolute inset-0 bg-black/80 opacity-25  ${
            !isLogin ? "rounded-tl-lg rounded-bl-lg" : "rounded-tr-lg rounded-br-lg"
          }`}
        ></div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-y-4 h-full text-white">
          <h1 ref={titleRef} className="text-4xl font-bold mb-4">
            {isLogin ? "Welcome Back!" : "Join Us Now!"}
          </h1>
          <p ref={subTitle} className="text-lg font-medium">
            {isLogin ? "Please login to continue" : "Please fill our form to continue."}
          </p>
        </div>
      </div>
      <div className={`${!isLogin ? "" : "hidden"}`} ref={registerRef}>
        <Register onLoginClick={handleSwitchToLogin} />
      </div>
    </section>
  )
}

export default AuthPage
