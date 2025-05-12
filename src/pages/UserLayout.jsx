import UserSidebar from "../components/User/UserSidebar"
import UserSideContent from "../components/User/UserSideContent"

const UserLayout = () => {
  return (
    <div className="flex h-screen">
      <UserSidebar />
      <UserSideContent />
    </div>
  )
}

export default UserLayout
