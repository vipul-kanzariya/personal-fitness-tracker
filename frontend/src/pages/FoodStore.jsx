import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function FoodStore() {
  const [food, setFood] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const food = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/food`,
        );
        setFood(food.data);
      } catch (err) {
        setError("Failed to load food items.");
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, []);
  const addToCart = (item) => {
    const exists = cart.find((c) => c._id === item._id);
    if (exists) {
      // quantity badhao
      setCart(
        cart.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    setTotalAmount(totalAmount + item.price);
  };
  const removeFromCart = (id) => {
    const item = cart.find((c) => c._id === id);
    if (item.quantity > 1) {
      setCart(
        cart.map((c) =>
          c._id === id ? { ...c, quantity: c.quantity - 1 } : c,
        ),
      );
    } else {
      setCart(cart.filter((c) => c._id !== id));
    }
    setTotalAmount(totalAmount - item.price);
  };
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    try {
      setOrdering(true);
      const token = localStorage.getItem("token");
      const items = cart.map((c) => ({
        foodId: c._id,
        name: c.name,
        price: c.price,
        quantity: c.quantity,
      }));

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        { items, totalAmount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Order placed successfully!");
      setCart([]);
      setTotalAmount(0);
    } catch (err) {
      console.log(err.message);
    } finally {
      setOrdering(false);
    }
  };
  return (
    <>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="container mt-4">
          <div className="row">
            {/* Food Items */}
            {/* Food Items */}
            <div className="col-md-8">
              <h4>🛒 Food Store</h4>
              <div className="row">
                {food.map((f) => (
                  <div className="col-md-4 mb-3" key={f._id}>
                    <div className="card p-3">
                      <img
                        src={f.image || "https://placehold.co/150x150"}
                        alt={f.name}
                        className="img-fluid mb-2"
                        style={{ height: "120px", objectFit: "cover" }}
                      />
                      <h6>{f.name}</h6>
                      <p>₹ {f.price}</p>
                      <p>{f.calories} cal</p>
                      <span className="badge bg-success">{f.category}</span>
                      <button
                        className="btn btn-primary btn-sm mt-2"
                        onClick={() => addToCart(f)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="col-md-4">
              <h4>🛍️ Cart</h4>
              {cart.map((c) => (
                <div className="card p-2 mb-2" key={c._id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{c.name}</span>
                    <span>x{c.quantity}</span>
                    <span>₹ {c.price * c.quantity}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(c._id)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
              <h5>Total: ₹ {totalAmount}</h5>
              <button
                className="btn btn-success w-100"
                onClick={handleOrder}
                disabled={ordering}
              >
                {ordering ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FoodStore;
