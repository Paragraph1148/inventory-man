import { useEffect, useState } from "react";
import api from "../api/api";

export default function PreOrder() {
  const [products, setProducts] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const selected = products.find((p) => p.id == productId);

  const handleReserve = async () => {
    setError("");

    try {
      await api.post("/orders/reservations", {
        productId,
        quantity: Number(quantity),
        memberId,
      });

      fetchProducts(); // refresh stock
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Reserve Stock</h2>

      <input
        placeholder="Member ID"
        onChange={(e) => setMemberId(e.target.value)}
        className="border p-2 w-full"
      />

      <select
        onChange={(e) => setProductId(e.target.value)}
        className="border p-2 w-full mt-2"
      >
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} (Available: {p.available_stock})
          </option>
        ))}
      </select>

      {selected && (
        <p className="text-sm text-gray-500 mt-2">
          Available: {selected.available_stock}
        </p>
      )}

      <input
        type="number"
        placeholder="Quantity"
        onChange={(e) => setQuantity(e.target.value)}
        className="border p-2 w-full mt-2"
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleReserve}
        className="bg-blue-500 text-white px-4 py-2 mt-3 rounded"
      >
        Reserve
      </button>
    </div>
  );
}
