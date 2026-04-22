import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);

  const [filters, setFilters] = useState({
    memberId: "",
    productId: "",
    from: "",
    to: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchMembers();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    const res = await api.get("/orders", { params: filters });
    setOrders(res.data);
  };

  const fetchMembers = async () => {
    const res = await api.get("/members");
    setMembers(res.data);
  };

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>

        <button
          onClick={() => navigate("/dashboard/orders/add")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          + Add Order
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow grid grid-cols-4 gap-3 mb-4">
        <select
          onChange={(e) => setFilters({ ...filters, memberId: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setFilters({ ...filters, productId: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          onClick={fetchOrders}
          className="col-span-4 bg-blue-500 text-white p-2 rounded"
        >
          Apply Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th>#</th>
              <th>Member</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} className="border-t text-center">
                <td>{i + 1}</td>
                <td>
                  {o.first_name} {o.last_name}
                </td>
                <td>{o.product}</td>
                <td>{o.quantity}</td>
                <td>{o.order_date}</td>
                <td>
                  <button
                    onClick={() => navigate(`/dashboard/orders/${o.id}/edit`)}
                    className="text-green-500"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
