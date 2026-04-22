import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    unit: "",
    hsnCode: "",
    description: "",
    taxPercent: "",
    mrp: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/products", {
        ...form,
        taxPercent: Number(form.taxPercent),
        mrp: Number(form.mrp),
      });

      navigate("/dashboard/products");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add product");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Add Product</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          placeholder="Product Name"
          required
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="unit"
          placeholder="Unit (pcs, kg, etc)"
          required
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="hsnCode"
          placeholder="HSN Code"
          required
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="taxPercent"
          placeholder="Tax %"
          type="number"
          required
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="mrp"
          placeholder="MRP"
          type="number"
          required
          onChange={handleChange}
          className="border p-2 w-full"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Product
        </button>
      </form>
    </div>
  );
}
