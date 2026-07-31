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

const [editId, setEditId] = useState(null);
const [editData, setEditData] = useState({});

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
const handleAutoFill = async () => {
  if (!foodName.trim()) {
    setError("Pehle food name daalo.");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    setLoading(true);
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/diet/estimate`,
      { foodName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCalories(res.data.calories);
    setProtein(res.data.protein);
    setCarbs(res.data.carbs);
    setFat(res.data.fat);
    setError(null);
  } catch (err) {
    setError("Nutrition estimate fail ho gaya. Values manually daal do.");
  } finally {
    setLoading(false);
  }
};
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
  const handleEdit = (diet) => {
  setEditId(diet._id);
  setEditData({
    calories: diet.calories,
    protein: diet.protein,
    carbs: diet.carbs,
    fat: diet.fat
  });
};
const handleUpdate = async (id) => {
  if (!editData.calories || editData.calories <= 0) {
    setError("Calories must be greater than 0.");
    return;
  }
  if (editData.protein !== undefined && editData.protein < 0) {
    setError("Protein cannot be negative.");
    return;
  }
  if (editData.carbs !== undefined && editData.carbs < 0) {
    setError("Carbs cannot be negative.");
    return;
  }
  if (editData.fat !== undefined && editData.fat < 0) {
    setError("Fat cannot be negative.");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/diet/${id}`,
      editData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDiets(diets.map((d) => (d._id === id ? res.data : d)));
    setEditId(null);
    setEditData({});
    setError('');
  } catch (err) {
    setError("Failed to update diet entry.");
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
          <div className="d-flex gap-2">
            <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)}
              id="food" placeholder="e.g. 2 boiled eggs" />
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAutoFill}>
              ✨ Auto-fill
            </button>
          </div>

          <label htmlFor="calories">Calories</label>
          <input
            type="number"
             min="0" 
            step="0.1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            id="calories"
            placeholder="Calories"
          />

          <label htmlFor="protein">Protein (g)</label>
          <input
            type="number"
             min="0" 
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            id="protein"
            placeholder="Protein"
          />

          <label htmlFor="carbs">Carbs (g)</label>
          <input
            type="number"
             min="0"  
            step="0.1"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            id="carbs"
            placeholder="Carbs"
          />

          <label htmlFor="fat">Fat (g)</label>
          <input
            type="number"
             min="0" 
            step="0.1"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            id="fat"
            placeholder="Fat"
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
      {editId === d._id ? (
        // ✅ Edit mode
        <>
          <td>{d.foodName}</td>
          <td>
            <input type="number" className="form-control" min="0" step="0.1"
              value={editData.calories}
              onChange={(e) => setEditData({...editData, calories: e.target.value})}/>
          </td>
          <td>
            <input type="number" className="form-control" min="0" step="0.1"
              value={editData.protein}
              onChange={(e) => setEditData({...editData, protein: e.target.value})}/>
          </td>
          <td>
            <input type="number" className="form-control" min="0" step="0.1"
              value={editData.carbs}
              onChange={(e) => setEditData({...editData, carbs: e.target.value})}/>
          </td>
          <td>
            <input type="number" className="form-control" min="0" step="0.1"
              value={editData.fat}
              onChange={(e) => setEditData({...editData, fat: e.target.value})}/>
          </td>
          <td>
            <button className="btn btn-success btn-sm me-1" onClick={() => handleUpdate(d._id)}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
          </td>
        </>
      ) : (
        // ✅ Normal mode
        <>
          <td>{d.foodName}</td>
          <td>{d.calories}</td>
          <td>{d.protein}</td>
          <td>{d.carbs}</td>
          <td>{d.fat}</td>
          <td>
            <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(d)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Delete</button>
          </td>
        </>
      )}
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