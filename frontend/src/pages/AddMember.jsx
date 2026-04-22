import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function AddMember() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contact: "",
    stateId: "",
    cityId: "",
    referralCode: "",
    leg: "",
    password: "",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState("");

  // ---------------------------
  // Fetch states
  // ---------------------------
  useEffect(() => {
    const fetchStates = async () => {
      const res = await api.get("/lookup/states");
      setStates(res.data);
    };
    fetchStates();
  }, []);

  // ---------------------------
  // Fetch cities when state changes
  // ---------------------------
  useEffect(() => {
    if (!form.stateId) return;

    const fetchCities = async () => {
      const res = await api.get(`/lookup/cities?stateId=${form.stateId}`);
      setCities(res.data);
    };

    fetchCities();
  }, [form.stateId]);

  // ---------------------------
  // Handle input change
  // ---------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "referralCode") {
      setForm({ ...form, referralCode: value.toUpperCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ---------------------------
  // Submit
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/members", form);
      navigate("/dashboard/members");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Add Member</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        {/* NAME */}
        <input
          name="firstName"
          placeholder="First Name"
          required
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="middleName"
          placeholder="Middle Name"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="lastName"
          placeholder="Last Name"
          required
          onChange={handleChange}
          className="border p-2 rounded"
        />

        {/* CONTACT */}
        <input
          name="email"
          placeholder="Email"
          required
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />
        <input
          name="contact"
          placeholder="Contact"
          required
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        {/* STATE */}
        <select
          name="stateId"
          value={form.stateId}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* CITY */}
        <select
          name="cityId"
          value={form.cityId}
          onChange={handleChange}
          className="border p-2 rounded"
          disabled={!form.stateId}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* REFERRAL */}
        <input
          name="referralCode"
          placeholder="Referral Code (optional)"
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        {/* LEG */}
        <select
          name="leg"
          value={form.leg}
          onChange={handleChange}
          disabled={!form.referralCode}
          className="border p-2 rounded col-span-2"
        >
          <option value="">Select Leg</option>
          <option value="L">Left</option>
          <option value="R">Right</option>
        </select>

        {/* PASSWORD */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        {error && <p className="text-red-500 col-span-2">{error}</p>}

        <button className="bg-blue-600 text-white py-2 rounded col-span-2">
          Add Member
        </button>
      </form>
    </div>
  );
}
