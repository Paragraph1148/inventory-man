import { useNavigate, Outlet } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-xl font-bold mb-6">Admin</h2>

        <div className="space-y-4">
          <button onClick={() => navigate("/dashboard")} className="block">
            Dashboard
          </button>

          <button
            onClick={() => navigate("/dashboard/members")}
            className="block"
          >
            Members
          </button>

          <button
            onClick={() => navigate("/dashboard/products")}
            className="block"
          >
            Products
          </button>

          <button
            onClick={() => navigate("/dashboard/orders")}
            className="block"
          >
            Orders
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
