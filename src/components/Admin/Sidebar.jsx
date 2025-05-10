import { Link } from "react-router-dom"

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="space-y-4">
        <Link to="/dashboard" className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9.75L12 3l9 6.75v10.5a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 20.25V9.75z"
            />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link to="/products" className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.25 14.25V19.5a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75v-5.25M21 9.75H3m18 0l-1.5-6h-13L3 9.75m18 0l-9 6.75L3 9.75"
            />
          </svg>
          <span>Products</span>
        </Link>

        <Link to="/users" className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21a8.25 8.25 0 0115 0M17.25 9.75a4.125 4.125 0 110 8.25"
            />
          </svg>
          <span>Users</span>
        </Link>

        <Link to="/settings" className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15.75A3.75 3.75 0 1112 8.25a3.75 3.75 0 010 7.5zM19.5 12a7.5 7.5 0 01-.58 2.91l1.64 1.64a.75.75 0 01-1.06 1.06l-1.64-1.64a7.5 7.5 0 01-2.91.58 7.5 7.5 0 01-2.91-.58l-1.64 1.64a.75.75 0 01-1.06-1.06l1.64-1.64a7.5 7.5 0 01-.58-2.91c0-1.03.2-2.02.58-2.91L5.41 7.5a.75.75 0 111.06-1.06l1.64 1.64a7.5 7.5 0 012.91-.58 7.5 7.5 0 012.91.58l1.64-1.64a.75.75 0 111.06 1.06l-1.64 1.64c.38.89.58 1.88.58 2.91z"
            />
          </svg>
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar
