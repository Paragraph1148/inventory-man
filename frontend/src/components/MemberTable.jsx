import { useNavigate } from "react-router-dom";

export default function MemberTable({ members, onDelete, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="w-full text-sm text-center border">
        {/* HEADER */}
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">S.No</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Total</th>
            <th>Left</th>
            <th>Right</th>
            <th>Date</th>
            <th>Actions</th>
            <th>Code</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {members.map((m, i) => (
            <tr key={m.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{i + 1}</td>

              <td className="font-medium">
                {m.first_name} {m.last_name}
              </td>

              <td>{m.contact}</td>

              <td className="text-gray-600">{m.email}</td>

              <td>
                <span className="bg-blue-100 px-2 py-1 rounded">
                  {m.total_subtree}
                </span>
              </td>

              <td>
                <span className="bg-green-100 px-2 py-1 rounded">
                  {m.total_left_leg}
                </span>
              </td>

              <td>
                <span className="bg-purple-100 px-2 py-1 rounded">
                  {m.total_right_leg}
                </span>
              </td>

              {/* DATE */}
              <td>{new Date(m.created_at).toLocaleDateString()}</td>

              {/* ACTIONS */}
              <td className="space-x-2">
                <button
                  onClick={() => onEdit(m.id)}
                  className="bg-yellow-400 px-2 py-1 rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(m.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </td>

              {/* REFERRAL CODE */}
              <td className="font-mono">
                <div className="flex items-center justify-center gap-2">
                  {m.referral_code}

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(m.referral_code)
                    }
                    className="text-blue-500 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {/* EMPTY STATE */}
          {members.length === 0 && (
            <tr>
              <td colSpan="10" className="p-4 text-center text-gray-500">
                No members found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
