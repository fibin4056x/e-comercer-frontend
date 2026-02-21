import axios from "axios";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "./checkout.css";
import { useContext } from "react";
import { Context } from "../../../registrationpage/loginpages/Logincontext";
import  {useNavigate} from "react-router-dom"
export default function Checkout() {
  const { cart ,user,setCart} = useContext(Context);

  const  sub=()=>{
    if(cart){
      setTimeout(() => {
     
        window.location.reload()
      }, 3000);
    }
}
const navigate=useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  ;

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  const onSubmit = async (data) => {
    sub();
    try {
      const orderData = {
        ...data,
        userId: user.id,
        items: cart,
        total
      };
      
      const response = await axios.post(
        "http://localhost:3000/order",
        orderData
      );   
       for (const item of cart) {
      await axios.delete(`http://localhost:3000/cart/${item.id}`);
    }
    
   
      console.log(response.data);
      toast.success("Order placed successfully");
    
      reset();
        navigate("/")
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>


      <div className="cart-summary">
        <h3>Order Summary</h3>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong> × {item.quantity} ={" "}
                ${item.price * item.quantity}
              </li>
            ))}
          </ul>
        )}
        <h4>Total: ${total}</h4>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="checkout-label">Contact</label>
        <input
          className="checkout-input"
          type="text"
          placeholder="Contact number"
          {...register("contact", {
            required: "Contact is required",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Must be 10 digits"
            }
          })}
        />
        {errors.contact && (
          <p className="checkout-error">{errors.contact.message}</p>
        )}

        <label className="checkout-label">First Name</label>
        <input
          className="checkout-input"
          type="text"
          placeholder="First name"
          {...register("firstname", { required: "First name is required" })}
        />
        {errors.firstname && (
          <p className="checkout-error">{errors.firstname.message}</p>
        )}

        <label className="checkout-label">Last Name</label>
        <input
          className="checkout-input"
          type="text"
          placeholder="Last name"
          {...register("lastname", { required: "Last name is required" })}
        />
        {errors.lastname && (
          <p className="checkout-error">{errors.lastname.message}</p>
        )}

        <label className="checkout-label">Address</label>
        <input
          className="checkout-input"
          type="text"
          placeholder="Street address"
          {...register("address", { required: "Address is required" })}
        />
        {errors.address && (
          <p className="checkout-error">{errors.address.message}</p>
        )}

        <label className="checkout-label">City</label>
        <input
          className="checkout-input"
          type="text"
          placeholder="City"
          {...register("city", { required: "City is required" })}
        />
        {errors.city && <p className="checkout-error">{errors.city.message}</p>}

        <label className="checkout-label">Postal Code</label>
        <input
          className="checkout-input"
          type="text"
          placeholder="Postal Code"
          {...register("postalcode", {
            required: "Postal code is required",
            pattern: {
              value: /^[0-9]{5,6}$/,
              message: "Must be 5–6 digits"
            }
          })}
        />
        {errors.postalcode && (
          <p className="checkout-error">{errors.postalcode.message}</p>
        )}

        <button className="checkout-button" type="submit" >
          Place Order
        </button>
      </form>
    </div>
  );
}
