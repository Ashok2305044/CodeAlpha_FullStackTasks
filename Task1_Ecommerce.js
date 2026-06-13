const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:20017/codealpha_ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected for E-commerce"))
  .catch(err => console.log(err));

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String
});
const Product = mongoose.model('Product', productSchema);

// Seed Data Route (Run once to populate database)
app.get('/api/seed', async (req, res) => {
    await Product.deleteMany({});
    const sampleProducts = [
        { name: "Wireless Mouse", price: 25, description: "Ergonomic 2.4GHz mouse", image: "https://via.placeholder.com/150" },
        { name: "Mechanical Keyboard", price: 75, description: "RGB backlit mechanical keyboard", image: "https://via.placeholder.com/150" },
        { name: "Gaming Headset", price: 50, description: "Immersive surround sound headset", image: "https://via.placeholder.com/150" }
    ];
    await Product.insertMany(sampleProducts);
    res.send("Database Seeded!");
});

// Get all products
app.get('/api/products', async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// Simple Order Processing Endpoint
app.post('/api/orders', (req, res) => {
    const { cartItems, total } = req.body;
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    res.json({ success: true, message: "Order processed successfully!", orderId: Math.floor(Math.random() * 100000) });
});

app.listen(5000, () => console.log("E-commerce Server running on port 5000"));
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleCheckout = () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: cart, total })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        alert(`${data.message} Order ID: ${data.orderId}`);
        setCart([]);
      }
    });
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>CodeAlpha E-commerce Store</h1>
      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '60%' }}>
          <h2>Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {products.map(prod => (
              <div key={prod._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <img src={prod.image} alt={prod.name} />
                <h3>{prod.name}</h3>
                <p>{prod.description}</p>
                <p><strong>${prod.price}</strong></p>
                <button onClick={() => addToCart(prod)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', cursor: 'pointer' }}>Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '35%', borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
          <h2>Shopping Cart ({cart.length})</h2>
          {cart.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>{item.name}</span>
              <span>${item.price}</span>
            </div>
          ))}
          <h3>Total: ${cart.reduce((sum, item) => sum + item.price, 0)}</h3>
          {cart.length > 0 && (
            <button onClick={handleCheckout} style={{ width: '100%', background: '#007bff', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer' }}>Checkout</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

