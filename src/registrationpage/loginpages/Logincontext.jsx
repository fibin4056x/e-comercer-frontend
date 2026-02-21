import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

const Context = createContext();

function Logincontext({ children }) {

  const [user, setuser] = useState({
    id: null,
    username: '',
    email: '',
    password: ''
  });
  const [cart, setcart] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setuser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      axios.get(`http://localhost:3000/cart?userId=${user.id}`)
        .then((res) => setcart(res.data))
        .catch(() => setcart([]));
    }
  }, [user]);

 
  const addtocart = async (product) => {
    if (!user || !user.id) {
      alert("Please login to add item to cart");
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };
      try {
        await axios.put(`http://localhost:3000/cart/${existingItem.id}`, updatedItem);
        setcart(cart.map(item => item.id === product.id ? updatedItem : item));
      } catch (err) {
        console.error(err);
      }
    } else {
      const newitem = {
        ...product,
        userId: user.id,
        quantity: 1
      };
      try {
        const res = await axios.post('http://localhost:3000/cart', newitem);
        setcart([...cart, res.data]);
      } catch (err) {
        console.error(err);
      }
    }
  };


  const logout = () => {
    setuser({
      id: null,
      username: '',
      email: '',
      password: ''
    });
    setcart([]);
    localStorage.removeItem("user");
  };

  return (
    <Context.Provider value={{ user, setuser, setcart, logout, cart, addtocart }}>
      {children}
    </Context.Provider>
  );
}

export default Logincontext;
export { Context };
