import Sidebar from "../components/Admin/Sidebar"
import MainContent from "../components/Admin/MainContent"

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent />
    </div>
  )
}

export default AdminLayout
