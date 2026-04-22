import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProducts(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>

        <button
          onClick={() => navigate("/dashboard/products/add")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">#</th>
              <th>Name</th>
              <th>Unit</th>
              <th>HSN</th>
              <th>Tax %</th>
              <th>MRP</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} className="border-t text-center">
                <td className="p-2">{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.unit}</td>
                <td>{p.hsn_code}</td>
                <td>{p.tax_percent}</td>
                <td>{p.mrp}</td>

                <td className="space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/products/${p.id}/edit`)}
                    className="text-green-500"
                  >
                    Edit
                  </button>{" "}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
