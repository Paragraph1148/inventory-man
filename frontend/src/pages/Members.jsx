import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
  });

  const navigate = useNavigate();

  const fetchMembers = async () => {
    const res = await api.get("/members", { params: filters });
    setMembers(res.data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
      <div className="bg-blue-500 text-white p-5">Tailwind Working</div>{" "}
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
      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-center border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">S.No</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Total</th>
              <th>Left</th>
              <th>Right</th>
              <th>Date</th>
              <th>Action</th>
              <th>Code</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} className="border-t">
                <td>{i + 1}</td>

                <td>
                  {m.first_name} {m.last_name}
                </td>

                <td>{m.contact}</td>
                <td>{m.email}</td>

                <td>{m.total_subtree}</td>
                <td>{m.total_left_leg}</td>
                <td>{m.total_right_leg}</td>

                <td>{m.referral_code}</td>

                <td>{new Date(m.created_at).toLocaleDateString()}</td>

                <td className="space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/members/${m.id}/edit`)}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    E
                  </button>

                  <button className="bg-red-500 text-white px-2 py-1 rounded">
                    D
                  </button>
                </td>
              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
