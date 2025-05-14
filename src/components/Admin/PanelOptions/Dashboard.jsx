import { useQuery } from "react-query"
import axiosInstance from "../../../utils/axiosInstance"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js"
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2"

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

const Dashboard = () => {
  // Fetch general counts
  const { data: dataCounts, isLoading: loadingCounts } = useQuery(["dashboardData"], () =>
    axiosInstance.get("/api/v1/dashboard/basic-data").then((res) => res.data.data)
  )

  // Fetch stats (orders & revenue)
  const { data: stats, isLoading: loadingStats } = useQuery(["dashboardStats"], () =>
    axiosInstance.get("/api/v1/dashboard/stats").then((res) => res.data.data)
  )

  // Revenue by delivery status
  const { data: revenueByStatus, isLoading: loadingRevenueStatus } = useQuery(
    ["revenueByDelivery"],
    () => axiosInstance.get("/api/v1/dashboard/delivery-status-stats").then((res) => res.data.data),
    {
      onSuccess: (data) => {
        console.log("Revenue Status:", data)
      }
    }
  )

  // Payment status stats
  const { data: paymentStats, isLoading: loadingPayment } = useQuery(["paymentStats"], () =>
    axiosInstance.get("/api/v1/dashboard/payment-status-stats").then((res) => res.data.data)
  )

  // Delivery status stats
  const { data: deliveryStats, isLoading: loadingDelivery } = useQuery(
    ["deliveryStats"],
    () => axiosInstance.get("/api/v1/dashboard/revenue-by-delivery-status").then((res) => res.data.data),
    {
      onSuccess: (data) => {
        console.log("Delivery Stats:", data)
      }
    }
  )

  // Most sold design
  const { data: topDesign, isLoading: loadingDesign } = useQuery(
    ["mostSoldDesign"],
    () => axiosInstance.get("/api/v1/dashboard/top-design").then((res) => res.data.data),
    {
      onSuccess: (data) => {
        console.log("Top Designs:", data)
      }
    }
  )

  // Monthly revenue trend
  const { data: monthlyRevenue, isLoading: loadingMonthlyRevenue } = useQuery(
    ["monthlyRevenue"],
    () => axiosInstance.get("/api/v1/dashboard/monthly-revenue").then((res) => res.data.data),
    {
      onSuccess: (data) => {
        console.log("Monthly Revenue:", data)
      }
    }
  )

  // Monthly signup trend
  const { data: signupStats, isLoading: loadingSignup } = useQuery(["monthlySignups"], () =>
    axiosInstance.get("/api/v1/dashboard/monthly-signups").then((res) => res.data.data)
  )

  if (
    loadingCounts ||
    loadingStats ||
    loadingRevenueStatus ||
    loadingPayment ||
    loadingDelivery ||
    loadingDesign ||
    loadingMonthlyRevenue ||
    loadingSignup
  ) {
    return <div className="p-6">Loading dashboard...</div>
  }

  // Prepare chart data
  const revenueStatusData = {
    labels: ["Pending", "Shipped", "Delivered", "Returned"],
    datasets: [
      {
        label: "Revenue",
        data: [
          revenueByStatus.pendingCount,
          revenueByStatus.shippedCount,
          revenueByStatus.deliveredCount,
          revenueByStatus.returnedCount
        ]
      }
    ]
  }

  const paymentData = {
    labels: ["Cash on Delivery", "Paid"],
    datasets: [
      {
        label: "Orders",
        data: [paymentStats.cashOnDeliveryCount, paymentStats.paidCount]
      }
    ]
  }

  const deliveryData = {
    labels: ["Pending", "Shipped", "Delivered"],
    datasets: [
      {
        label: "Orders",
        data: [deliveryStats.pendingRevenue, deliveryStats.shippedRevenue, deliveryStats.deliveredRevenue]
      }
    ]
  }

  const TOTAL_MONTHS = 12

  // 2. Create a zero‑filled array and populate it
  const revenueByMonth = Array(TOTAL_MONTHS).fill(0)
  monthlyRevenue.forEach(({ _id, totalRevenue }) => {
    // Month _id is 1–12
    revenueByMonth[_id - 1] = totalRevenue
  })

  // 3. Build your labels & dataset off that
  const monthlyRevData = {
    labels: Array.from({ length: TOTAL_MONTHS }, (_, i) => `Month ${i + 1}`),
    datasets: [
      {
        label: "Revenue",
        data: revenueByMonth,
        fill: false, // if you later switch to a line chart
        tension: 0.1 // for a little smoothing
      }
    ]
  }

  // const TOTAL_MONTHS = 12
  const countsByMonth = Array(TOTAL_MONTHS).fill(0)
  signupStats.forEach(({ _id, count }) => {
    countsByMonth[_id - 1] = count
  })

  const signupData = {
    labels: Array.from({ length: TOTAL_MONTHS }, (_, i) => `Month ${i + 1}`),
    datasets: [
      {
        label: "Signups",
        data: countsByMonth,
        fill: false,
        tension: 0.1
      }
    ]
  }

  return (
    <div className="p-6 space-y-6 bg-gray-100 h-full overflow-auto font-poppins">
      {/* Top counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Orders</h3>
          <p className="text-2xl font-semibold">{dataCounts.orderCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Products</h3>
          <p className="text-2xl font-semibold">{dataCounts.productCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Users</h3>
          <p className="text-2xl font-semibold">{dataCounts.userCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Designs</h3>
          <p className="text-2xl font-semibold">{dataCounts.designCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Categories</h3>
          <p className="text-2xl font-semibold">{dataCounts.categoryCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Models</h3>
          <p className="text-2xl font-semibold">{dataCounts.modelCount}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Revenue by Delivery Status</h3>
          <Bar data={revenueStatusData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Payment Method Distribution</h3>
          <Pie data={paymentData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Delivery Status Distribution</h3>
          <Doughnut data={deliveryData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Monthly Revenue Trend</h3>
          <Line data={monthlyRevData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Monthly User Signups</h3>
          <Line data={signupData} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium mb-2">Top Selling Design</h3>
          {topDesign?.design ? (
            <div>
              <img src={topDesign.design.imageUrl} alt={topDesign.design.name} className="h-24 w-24 object-cover rounded" />
              <p className="mt-2 text-lg font-semibold">
                {topDesign.design.name} ({topDesign.count})
              </p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
