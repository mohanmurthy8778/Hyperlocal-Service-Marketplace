const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/customer/profile/image', upload.single('file'), (req, res) => {
  const url = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200";
  customerProfile.profileImage = url;
  res.json({ imageUrl: url, message: "Profile image uploaded successfully" });
});
