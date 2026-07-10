// Mock DB for Customer Profile
let customerProfile = {
  id: 1,
  userId: 101,
  email: "mohanmurthy8778@gmail.com",
  firstName: "Mohan",
  lastName: "Murthy",
  phone: "+918778383588",
  profileImage: "",
  gender: "Male",
  dob: "1990-01-01",
  emergencyPhone: "",
  bio: "Looking for local services.",
  address: "123 Main St",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  zipCode: "560001",
  preferredLanguage: "en",
  createdAt: new Date().toISOString()
};

app.get('/api/customer/profile', (req, res) => {
  res.json(customerProfile);
});

app.put('/api/customer/profile', (req, res) => {
  customerProfile = { ...customerProfile, ...req.body };
  res.json(customerProfile);
});

app.post('/api/customer/profile/image', (req, res) => {
  // just pretend we uploaded and it returned a dummy url
  const url = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200";
  customerProfile.profileImage = url;
  res.json({ imageUrl: url, message: "Profile image uploaded successfully" });
});

app.put('/api/customer/change-password', (req, res) => {
  res.json({ message: "Password changed successfully" });
});
