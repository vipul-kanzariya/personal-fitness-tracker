import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/FoodStore.css"; // External stylesheet
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiShoppingCart, FiActivity } from "react-icons/fi";

function FoodStore() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [food, setFood] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const syncCartCount = () => {
    const savedCart = JSON.parse(localStorage.getItem("foodCart") || "[]");
    setCartCount(savedCart.reduce((total, item) => total + item.quantity, 0));
  };

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
    syncCartCount();
  }, []);

  const addToCart = (item) => {
    const availableQuantity = Number(item.availableQuantity ?? item.inventory?.availableQuantity ?? 0);
    const isOutOfStock = availableQuantity <= 0;

    if (isOutOfStock) {
      toast.error(`${item.name} is currently out of stock.`);
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem("foodCart") || "[]");
    const existingItem = savedCart.find((cartItem) => cartItem._id === item._id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty >= availableQuantity) {
      toast.warning(`Only ${availableQuantity} unit${availableQuantity > 1 ? "s" : ""} available.`);
      return;
    }

    const updatedCart = existingItem
      ? savedCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      : [...savedCart, { ...item, quantity: 1 }];

    localStorage.setItem("foodCart", JSON.stringify(updatedCart));
    syncCartCount();
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="text-center mb-4">
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill small fw-bold text-uppercase mb-2">
          Nutrition & Meals
        </span>
        <h2 className="fw-bold mb-1 apex-title" style={{ color: colors?.textPrimary || "var(--text-primary)" }}>
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
            <h5
              className="fw-bold mb-3 d-flex align-items-center gap-2"
              style={{ color: colors?.textPrimary || "var(--text-primary, #ffffff)" }}
            >
              <FiShoppingCart aria-hidden="true" /> AVAILABLE MEALS
            </h5>
            <div className="row g-3">
              {food.map((f) => {
                const availableQuantity = Number(f.availableQuantity ?? f.inventory?.availableQuantity ?? 0);
                const isOutOfStock = availableQuantity <= 0;

                return (
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
                            <FiActivity aria-hidden="true" /> {f.calories} cal
                          </span>
                        </div>
                        <div className={`small mb-3 ${isOutOfStock ? 'text-danger' : 'text-success'} fw-semibold`}>
                          {isOutOfStock ? 'Out of Stock' : `Available: ${availableQuantity}`}
                        </div>
                      </div>
                      <button
                        className="btn btn-neon w-100 py-2 btn-sm text-uppercase"
                        onClick={() => addToCart(f)}
                        disabled={isOutOfStock}
                        style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                      >
                        {isOutOfStock ? 'Out of Stock' : '+ Add To Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="col-lg-4">
            <div className="card dark-card p-4 sticky-top cart-sidebar">
              <h5
                className="fw-bold mb-3 d-flex align-items-center gap-2"
                style={{ color: colors?.textPrimary || "var(--text-primary, #ffffff)" }}
              >
                <FiShoppingBag aria-hidden="true" /> YOUR CART
              </h5>

              <div className="text-center py-3 text-subtle border rounded-3 mb-3" style={{ borderColor: "var(--border-color)" }}>
                <FiShoppingBag className="display-6 mb-2" aria-hidden="true" />
                <p className="mb-1 fw-semibold">{cartCount ? `${cartCount} item${cartCount > 1 ? "s" : ""} ready` : "Your cart is empty"}</p>
                <small>Review your items and complete payment on the Orders page.</small>
              </div>
              <button
                className="btn btn-neon w-100 py-2.5 text-uppercase"
                onClick={() => navigate("/orders")}
                disabled={cartCount === 0}
              >
                Review Cart & Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodStore;