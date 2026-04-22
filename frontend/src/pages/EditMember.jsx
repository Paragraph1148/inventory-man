import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [members, setMembers] = useState([]);
  const [moveData, setMoveData] = useState({
    newReferrerId: "",
    newLeg: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get("/members");
    const member = res.data.find((m) => m.id === Number(id));

    setForm({
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      contact: member.contact,
    });

    setMembers(res.data);
  };

  // -------------------------
  // BASIC UPDATE
  // -------------------------
  const handleBasicUpdate = async (e) => {
    e.preventDefault();

    await api.patch(`/members/${id}`, form);
    alert("Updated successfully");
  };

  // -------------------------
  // MOVE MEMBER
  // -------------------------
  const handleMove = async (e) => {
    e.preventDefault();

    await api.post(`/members/${id}/move`, moveData);
    alert("Member moved");
    navigate("/dashboard/members");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* -------- BASIC INFO -------- */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg mb-4">Edit Details</h2>

        <form onSubmit={handleBasicUpdate} className="space-y-3">
          <input
            name="firstName"
            value={form.firstName || ""}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            name="lastName"
            value={form.lastName || ""}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            name="email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 w-full"
          />
          <input
            name="contact"
            value={form.contact || ""}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="border p-2 w-full"
          />

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Details
          </button>
        </form>
      </div>

      {/* -------- MOVE MEMBER -------- */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg mb-4">Change Position</h2>

        <form onSubmit={handleMove} className="space-y-3">
          {/* Referrer */}
          <select
            onChange={(e) =>
              setMoveData({ ...moveData, newReferrerId: e.target.value })
            }
            className="border p-2 w-full"
          >
            <option value="">Select New Referrer</option>
            {members
              .filter((m) => m.id !== Number(id)) // can't refer itself
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} (ID: {m.id})
                </option>
              ))}
          </select>

          {/* Leg */}
          <select
            onChange={(e) =>
              setMoveData({ ...moveData, newLeg: e.target.value })
            }
            className="border p-2 w-full"
          >
            <option value="">Select Leg</option>
            <option value="L">Left</option>
            <option value="R">Right</option>
          </select>

          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Move Member
          </button>
        </form>
      </div>
    </div>
  );
}
