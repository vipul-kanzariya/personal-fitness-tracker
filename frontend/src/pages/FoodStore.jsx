import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/FoodStore.css"; // External stylesheet

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
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/food`
        );
        setFood(res.data);
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
      setCart(
        cart.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        )
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
          c._id === id ? { ...c, quantity: c.quantity - 1 } : c
        )
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
        { headers: { Authorization: `Bearer ${token}` } }
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
    <div className="container mt-4">
      {/* Header Section */}
      <div className="text-center mb-4">
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill small fw-bold text-uppercase mb-2">
          Nutrition & Meals
        </span>
        <h2 className="fw-bold mb-1 apex-title">
          HEALTHY <span className="text-neon-green">FOOD STORE</span>
        </h2>
        <p className="text-subtle small">
          Fuel your fitness journey with high-protein and nutrient-rich meals.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 mb-4 rounded-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="row g-4">
          {/* Food Items Catalog */}
          <div className="col-lg-8">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 ">
              🛒 AVAILABLE MEALS
            </h5>
            <div className="row g-3">
              {food.map((f) => (
                <div className="col-12 col-sm-6 col-md-4" key={f._id}>
                  <div className="card dark-card food-card p-3 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="food-img-container mb-3">
                        <img
                          src={f.image || "https://placehold.co/150x150"}
                          alt={f.name}
                          className="food-img"
                        />
                        <span className="badge category-badge rounded-pill fw-semibold">
                          {f.category}
                        </span>
                      </div>
                      <h6 className="fw-bold food-title mb-1">
                        {f.name}
                      </h6>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-neon-green fw-bold fs-5">
                          ₹{f.price}
                        </span>
                        <span className="text-subtle small">
                          🔥 {f.calories} cal
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-neon w-100 py-2 btn-sm text-uppercase"
                      onClick={() => addToCart(f)}
                    >
                      + Add To Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="col-lg-4">
            <div className="card dark-card p-4 sticky-top cart-sidebar">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                🛍️ YOUR CART
              </h5>

              {cart.length === 0 ? (
                <div className="text-center py-4 text-subtle border rounded-3 mb-3" style={{ borderColor: "var(--border-color)" }}>
                  <p className="mb-0 small">Your cart is empty.</p>
                </div>
              ) : (
                <div className="cart-items-container mb-3">
                  {cart.map((c) => (
                    <div
                      key={c._id}
                      className="cart-item-row p-3 mb-2 rounded-3 d-flex justify-content-between align-items-center"
                    >
                      <div className="cart-item-title">
                        <h6 className="fw-bold mb-0 text-truncate">
                          {c.name}
                        </h6>
                        <small className="text-subtle">
                          ₹{c.price} × {c.quantity}
                        </small>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="text-neon-green fw-bold">
                          ₹{c.price * c.quantity}
                        </span>
                        <button
                          className="btn btn-outline-danger btn-sm px-2 py-0 border-0"
                          onClick={() => removeFromCart(c._id)}
                          title="Remove one"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Summary */}
              <div className="border-top pt-3 mb-3" style={{ borderColor: "var(--border-color)" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-subtle fw-semibold">
                    Total Amount:
                  </span>
                  <span className="text-neon-green fw-bold fs-4">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-neon w-100 py-2.5 text-uppercase"
                onClick={handleOrder}
                disabled={ordering || cart.length === 0}
              >
                {ordering ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodStore;