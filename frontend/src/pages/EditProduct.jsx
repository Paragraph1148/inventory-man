import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const res = await api.get("/products");
    const product = res.data.find((p) => p.id === Number(id));
    setForm(product);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.patch(`/products/${id}`, form);
    navigate("/dashboard/products");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          name="unit"
          value={form.unit || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          name="hsn_code"
          value={form.hsn_code || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          name="tax_percent"
          value={form.tax_percent || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          name="mrp"
          value={form.mrp || ""}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
