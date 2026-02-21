import axios from 'axios';
import React, { createContext, useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Context } from '../../../registrationpage/loginpages/Logincontext';

const OrderContext = createContext();

export default function OrderProvider({ children }) {
  const { user } = useContext(Context);
  const [Order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:3000/order?userId=${user.id}`);
          setOrder(response.data || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to fetch orders');
          setOrder([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOrder([]);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const cancelOrderById = async (orderId) => {
   if(!window.confirm)return;{
       try {
      await axios.delete(`http://localhost:3000/order/${orderId}`);
      setOrder((prev) => prev.filter((o) => o.id !== orderId));
      toast.info('Order cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    }

   }
  };

  const cancelAllOrders = async () => {
    try {
      await Promise.all(Order.map((o) => axios.delete(`http://localhost:3000/order/${o.id}`)));
      setOrder([]);
      toast.info('All orders cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel all orders:', error);
      toast.error('Failed to cancel all orders');
    }
  };

  return (
    <OrderContext.Provider value={{ Order, setOrder, cancelOrderById, cancelAllOrders, loading }}>
      {children}
    </OrderContext.Provider>
  );
}

export { OrderContext };
