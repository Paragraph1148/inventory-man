import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    memberId: "",
    productId: "",
    quantity: "",
    orderDate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);
  const selectedProduct = products.find((p) => p.id == form.productId);
  const [error, setError] = useState("");
  const cleanDate = form.orderDate.includes("T")
    ? form.orderDate.split("T")[0]
    : form.orderDate;

  const fetchData = async () => {
    const [ordersRes, membersRes, productsRes] = await Promise.all([
      api.get("/orders"),
      api.get("/members"),
      api.get("/products"),
    ]);

    const order = ordersRes.data.find((o) => o.id === Number(id));

    setForm({
      memberId: order.member_id,
      productId: order.product_id,
      quantity: order.quantity,
      orderDate: order.order_date,
    });

    setMembers(membersRes.data);
    setProducts(productsRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.patch(`/orders/${id}`, {
        ...form,
        quantity: Number(form.quantity),
        orderDate: form.orderDate.split("T")[0],
      });

      navigate("/dashboard/orders");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update order");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Edit Order</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={form.memberId}
          onChange={(e) => setForm({ ...form, memberId: e.target.value })}
          className="border p-2 w-full"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name} {m.last_name}
            </option>
          ))}
        </select>

        <select
          value={form.productId}
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="border p-2 w-full"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {selectedProduct && (
          <p className="text-sm text-gray-500">
            Available: {selectedProduct.stock}
          </p>
        )}

        <input
          type="number"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={form.orderDate}
          onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
          className="border p-2 w-full"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
