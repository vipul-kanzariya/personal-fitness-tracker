import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
function Diet() {
  const [diets, setDiets] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [carbs, setCarbs] = useState();
  const [protein, setProtein] = useState();
  const [fat, setFat] = useState();
  const [calories, setCalories] = useState();
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState();

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const diets = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/diet`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setDiets(diets.data);
      } catch (err) {
        setError('Failed to load diet entries.');
      } finally {
        setLoading(false);
      }
    };
    fetchDiet();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/diet`,
        {
          foodName,
          calories,
          protein,
          carbs,
          fat,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDiets([res.data, ...diets]);

      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/diet/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiets(diets.filter((d) => d._id !== id));
      
    } catch (err) {
      console.log(err.message);
    }finally {
  setLoading(false); 
}
  };
  return (
    <>
    {error && (
  <div className='alert alert-danger mt-3'>
     {error}
  </div>
)}
      <div className="container mt-4">
        <form onSubmit={handleSubmit}>
          <label htmlFor="food">Food name</label>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            id="food"
            placeholder="Enter Food name"
          />

          <label htmlFor="calories">Calories</label>
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            id="calories"
            placeholder="Enter Calories"
          />

          <label htmlFor="protein">Protein</label>
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            id="protein"
            placeholder="Enter Protein"
          />

          <label htmlFor="carbs">Carbs</label>
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            id="carbs"
            placeholder="Enter Carbs"
          />

          <label htmlFor="fat">Fat</label>
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            id="fat"
            placeholder="Enter Calories"
          />
          <button type="submit">Submit</button>
        </form>
        {loading ? (
          <Spinner />
        ) : (
          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>Food Name</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Carbs</th>
                <th>Fat</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {diets.map((d) => (
                <tr key={d._id}>
                  <td>{d.foodName}</td>
                  <td>{d.calories}</td>
                  <td>{d.protein}</td>
                  <td>{d.carbs}</td>
                  <td>{d.fat}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(d._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Diet;
