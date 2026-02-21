import React, { useContext, useEffect, useState } from 'react';
import { OrderContext } from './ordercontext';
import './order.css';
import { Context } from '../../../registrationpage/loginpages/Logincontext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Order() {
  const { user } = useContext(Context);
  const { Order, setOrder, cancelOrderById, cancelAllOrders } = useContext(OrderContext);
  const [countdowns, setCountdowns] = useState({});
  const [confirmModal, setConfirmModal] = useState({ visible: false, type: '', orderId: null });


  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = {};
      if (Order && Order.length > 0) {
        Order.forEach((order) => {
          if (order.deliveryTime && order.status === 'Pending') {
            const diff = order.deliveryTime - Date.now();
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            newCountdowns[order.id] =
              diff > 0
                ? `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : '00:00';

            if (diff <= 0 && order.status !== 'Delivered') {
           
              setOrder((prevOrders) =>
                prevOrders.map((o) =>
                  o.id === order.id ? { ...o, status: 'Delivered' } : o
                )
              );

              axios.patch(`http://localhost:3000/order/${order.id}`, { status: 'Delivered' })
                .catch(console.error);

              toast.info(`Order ${order.id} delivered!`);
            }
          } else {
            newCountdowns[order.id] = null;
          }
        });
      }
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [Order, setOrder]);

  const formatDeliveryTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };


  const handleConfirmCancel = (type, orderId = null) => {
    setConfirmModal({ visible: true, type, orderId });
  };

  const handleCancelConfirmed = () => {
    if (confirmModal.type === 'single') {
      cancelOrderById(confirmModal.orderId);
    } else if (confirmModal.type === 'all') {
      cancelAllOrders();
    }
    setConfirmModal({ visible: false, type: '', orderId: null });
  };

  const handleCancelDecline = () => {
    setConfirmModal({ visible: false, type: '', orderId: null });
  };

  return (
    <div className="orders-wrapper unique-orders">
      {user ? (
        Order && Order.length > 0 ? (
          <>
            <button className="cancel-all-btn" onClick={() => handleConfirmCancel('all')}>
              Cancel All Orders
            </button>

            {Order.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h2 className="order-id">Order ID: {order.id}</h2>
                  {order.status === 'Pending' && (
                    <button
                      className="cancel-order-btn"
                      onClick={() => handleConfirmCancel('single', order.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="customer-info">
                  <p className="customer-name">{order.firstname || ''} {order.lastname || ''}</p>
                  <p className="customer-contact">Contact: {order.contact || 'N/A'}</p>
                  <p className="customer-address">
                    {order.address || ''}, {order.city || ''} - {order.postalcode || ''}
                  </p>
                </div>

                {order.items && order.items.length > 0 ? (
                  <ul className="order-items-list">
                    {order.items.map((item) => (
                      <li key={item.id} className="order-item">
                        <img
                          src={item.images?.[0] || '/placeholder.png'}
                          alt={item.name || 'Product'}
                          className="order-item-img"
                        />
                        <div className="order-item-info">
                          <h3 className="item-name">{item.name}</h3>
                          <p className="item-price">Price: ${item.price}</p>
                          <p className="item-quantity">Quantity: {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-items">No items in this order</p>
                )}

                <p className="order-delivery-time">
                  Delivery Time: {formatDeliveryTime(order.deliveryTime)}
                </p>

                {order.deliveryTime && order.status === 'Pending' && (
                  <p className="delivery-countdown">
                    Delivery in: {countdowns[order.id] || '00:00'}
                  </p>
                )}

                <h3 className="order-total">Total: ${order.total || 0}</h3>

                <p className={`order-status status ${order.status ? order.status.toLowerCase() : ''}`}>
                  Status: {order.status || 'Unknown'}
                </p>
              </div>
            ))}

       
            {confirmModal.visible && (
              <div className="confirm-modal">
                <div className="confirm-box">
                  <p>
                    Are you sure you want to{' '}
                    {confirmModal.type === 'all' ? 'cancel all orders' : 'cancel this order'}?
                  </p>
                  <div className="confirm-buttons">
                    <button className="confirm-btn yes" onClick={handleCancelConfirmed}>Yes</button>
                    <button className="confirm-btn no" onClick={handleCancelDecline}>No</button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="no-orders">No orders found</p>
        )
      ) : (
        <h2>Please login to see your orders</h2>
      )}
    </div>
  );
}
