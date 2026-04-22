import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import EditMember from "./pages/EditMember";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import AddOrder from "./pages/AddOrder";
import EditOrder from "./pages/EditOrder";

// temporary pages
const Home = () => <div>Welcome to Dashboard</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="orders/:id/edit" element={<EditOrder />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/add" element={<AddOrder />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="members/:id/edit" element={<EditMember />} />
          <Route path="members/add" element={<AddMember />} />
          <Route path="members" element={<Members />} />{" "}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
