import { Outlet } from "react-router-dom"

const MainContent = () => {
  return (
    <main className="flex-1 bg-custom-white p-6 overflow-auto h-screen">
      <Outlet />
    </main>
  )
}

export default MainContent
