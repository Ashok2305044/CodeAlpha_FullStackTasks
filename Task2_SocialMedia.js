const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:20017/codealpha_social', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected for Social Media"));

const postSchema = new mongoose.Schema({
    username: String,
    content: String,
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Get All Posts
app.get('/api/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

// Create Post
app.post('/api/posts', async (req, res) => {
    const { username, content } = req.body;
    const newPost = new Post({ username, content });
    await newPost.save();
    res.json(newPost);
});

// Like a Post
app.put('/api/posts/:id/like', async (req, res) => {
    const post = await Post.findById(req.id || req.params.id);
    if (post) {
        post.likes += 1;
        await post.save();
        res.json(post);
    } else {
        res.status(404).send("Post not found");
    }
});

app.listen(5001, () => console.log("Social Media Server running on port 5001"));
import React, { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');

  const fetchPosts = () => {
    fetch('http://localhost:5001/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!username || !content) return;

    fetch('http://localhost:5001/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, content })
    })
    .then(res => res.json())
    .then(() => {
      setContent('');
      fetchPosts();
    });
  };

  const handleLike = (id) => {
    fetch(`http://localhost:5001/api/posts/${id}/like`, { method: 'PUT' })
      .then(res => res.json())
      .then(() => fetchPosts());
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>CodeAlpha Social Feed</h1>
      <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <input type="text" placeholder="Your Name" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '8px' }} />
        <textarea placeholder="What's on your mind?" value={content} onChange={e => setContent(e.target.value)} style={{ padding: '8px', height: '60px' }} />
        <button type="submit" style={{ background: '#17a2b8', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer' }}>Post</button>
      </form>

      <div>
        {posts.map(post => (
          <div key={post._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginBottom: '15px', background: '#f9f9f9' }}>
            <h4>@{post.username}</h4>
            <p>{post.content}</p>
            <button onClick={() => handleLike(post._id)} style={{ background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
              ❤️ {post.likes} Likes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

