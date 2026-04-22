import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AddOrder() {
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
    fetchMembers();
    fetchProducts();
  }, []);

  const fetchMembers = async () => {
    const res = await api.get("/members");
    setMembers(res.data);
  };

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/orders", form);
    navigate("/dashboard/orders");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Add Order</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          required
          onChange={(e) => setForm({ ...form, memberId: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="">Select Member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name} {m.last_name}
            </option>
          ))}
        </select>

        <select
          required
          onChange={(e) => setForm({ ...form, productId: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          required
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          type="date"
          required
          onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
          className="border p-2 w-full"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Order
        </button>
      </form>
    </div>
  );
}
