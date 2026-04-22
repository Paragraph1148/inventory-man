import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import MemberTable from "../components/MemberTable";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
  });

  const navigate = useNavigate();

  // ---------------------------
  // Fetch members
  // ---------------------------
  const fetchMembers = async () => {
    try {
      const res = await api.get("/members", { params: filters });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // ---------------------------
  // Delete handler
  // ---------------------------
  const handleDelete = async (id) => {
    if (!confirm("Delete this member?")) return;

    try {
      await api.delete(`/members/${id}`);
      fetchMembers(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------------
  // Edit handler
  // ---------------------------
  const handleEdit = (id) => {
    navigate(`/dashboard/members/${id}/edit`);
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Member List</h2>

        <button
          onClick={() => navigate("/dashboard/members/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Member
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded shadow flex gap-3 items-center mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border p-2 rounded w-1/4"
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
        />

        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
        />

        <button
          onClick={fetchMembers}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* TABLE (Component) */}
      <MemberTable
        members={members}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
