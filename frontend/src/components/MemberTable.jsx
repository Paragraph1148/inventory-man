import { useNavigate } from "react-router-dom";

export default function MemberTable({ members, onDelete, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">#</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Total</th>
            <th>Left</th>
            <th>Right</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {members.map((m, i) => (
            <tr key={m.id} className="border-t text-center">
              <td className="p-2">{i + 1}</td>

              <td>
                {m.first_name} {m.last_name}
              </td>

              <td>{m.contact}</td>
              <td>{m.email}</td>

              <td>{m.total_subtree}</td>
              <td>{m.total_left_leg}</td>
              <td>{m.total_right_leg}</td>

              <td>{new Date(m.created_at).toLocaleDateString()}</td>

              <td className="space-x-2">
                <button onClick={() => onEdit(m.id)} className="text-green-500">
                  Edit
                </button>

                <button onClick={() => onDelete(m.id)} className="text-red-500">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {members.length === 0 && (
            <tr>
              <td colSpan="9" className="p-4 text-center">
                No members found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
