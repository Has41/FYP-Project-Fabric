import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import { FiTrash2 } from "react-icons/fi"

const UserDetails = () => {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState(null)

  const {
    data: users = [],
    isLoading,
    isError
  } = useQuery(
    ["users"],
    async () => {
      const res = await axiosInstance.get("/api/v1/users/all-users")
      return res.data.data
    },
    {
      onSuccess: (data) => {
        console.log(data)
      }
    }
  )

  const deleteMutation = useMutation(
    async (id) => {
      const res = await axiosInstance.delete(`/api/v1/users/delete-user-admin/${id}`)
      return res.data.data
    },
    {
      onMutate: (id) => {
        setDeletingId(id)
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["users"])
        setDeletingId(null)
      },
      onError: () => {
        setDeletingId(null)
      }
    }
  )

  if (isLoading) return <div className="p-6">Loading users...</div>
  if (isError) return <div className="p-6 text-red-500">Error loading users</div>

  return (
    <div className="p-6 h-full overflow-auto font-poppins">
      <h2 className="mb-4 text-2xl font-bold text-black/80">Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white">
          <thead className="bg-button-color text-white">
            <tr className="text-sm lg:text-base">
              <th className="border border-custom-border px-4 py-2">#</th>
              <th className="border border-custom-border px-4 py-2">Name</th>
              <th className="border border-custom-border px-4 py-2">Email</th>
              <th className="border border-custom-border px-4 py-2">Role</th>
              <th className="border border-custom-border px-4 py-2">Designs</th>
              <th className="border border-custom-border px-4 py-2">Orders</th>
              <th className="border border-custom-border px-4 py-2">Joined</th>
              <th className="border border-custom-border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) => user.role !== "admin")
              .map((user, index) => (
                <tr key={user._id} className="text-center text-sm hover:bg-gray-50 lg:text-base">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{user.fullname}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2 capitalize">{user.role}</td>
                  <td className="border px-4 py-2">{user.designsCount}</td>
                  <td className="border px-4 py-2">{user.ordersCount}</td>
                  <td className="border px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => deleteMutation.mutate(user._id)}
                      disabled={deletingId === user._id || deleteMutation.isLoading}
                      className="flex items-center gap-1 mx-auto p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete User"
                    >
                      {deletingId === user._id && deleteMutation.isLoading ? (
                        "Deleting..."
                      ) : (
                        <>
                          <FiTrash2 size={16} />
                          <span className="hidden sm:inline">Delete</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserDetails
