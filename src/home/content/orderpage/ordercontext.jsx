import React, { createContext, useEffect, useState, useContext } from "react";
import { request } from "../../../services/api";
import { toast } from "react-toastify";
import { Context } from "../../../registrationpage/loginpages/Logincontext";

const OrderContext = createContext();

export default function OrderProvider({ children }) {

  const { user } = useContext(Context);

  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(false);


  /* ================= FETCH ORDERS ================= */

  const fetchOrders = async () => {

    if(!user){
      setOrders([]);
      return;
    }

    try{

      setLoading(true);

      console.log("📥 Fetching user orders");

      const data = await request("/orders/my");

      console.log("📦 Orders:",data);

      setOrders(Array.isArray(data) ? data : []);

    }catch(err){

      console.error("❌ Orders fetch error:",err);

      toast.error(err.message || "Failed to fetch orders");

      setOrders([]);

    }finally{

      setLoading(false);

    }

  };


  /* ================= CANCEL ORDER ================= */

  const cancelOrder = async(id)=>{

    try{

      await request(`/orders/${id}/cancel`,"PUT");

      setOrders(prev =>
        prev.map(o =>
          o._id === id
            ? {...o,status:"Cancelled"}
            : o
        )
      );

      toast.success("Order cancelled");

    }catch(err){

      console.error("Cancel error:",err);

      toast.error("Cancel failed");

    }

  };


  /* ================= LOAD ORDERS ================= */

  useEffect(()=>{

    fetchOrders();

  },[user]);


  return(

    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        loading,
        fetchOrders,
        cancelOrder
      }}
    >
      {children}
    </OrderContext.Provider>

  );

}

export { OrderContext };