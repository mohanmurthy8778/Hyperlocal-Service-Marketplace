import jwt from "jsonwebtoken";
import multer from 'multer';
import express from "express";
import fs from 'fs';

import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./server_socket";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let providersDb: any[] = [];
let bookingsDb: any[] = [];

const getActualProviderId = (user: any) => {
  if (!user) return null;
  const provider = providersDb.find(p => p.email && String(p.email).toLowerCase() === String(user.email).toLowerCase());
  return provider ? provider.id : user.id;
};

setupSocket(io, bookingsDb, providersDb);
const PORT = 3000;

app.use(express.json());



const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-servicehub-app';

// Middleware for RBAC
// JWTMiddleware
const JWTMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    (req as any).user = user;
    next();
  });
};

// RoleMiddleware
const RoleMiddleware = (roles) => {
  return (req, res, next) => {
    if ((req as any).user && roles.includes((req as any).user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
  };
};




app.post('/api/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  // Dummy verify
  try {
    const user = jwt.verify(refreshToken, JWT_SECRET) as any;
    const newToken = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ accessToken: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role = 'customer' } = req.body;
  
  let id = `${role}-123`;
  if (role === 'provider' || role === 'SERVICE_PROVIDER') {
    const provider = providersDb.find(p => p.email && String(p.email).toLowerCase() === String(email).toLowerCase());
    if (provider) {
      id = provider.id;
    }
  }
  
  const token = jwt.sign({ id, role, name: email.split('@')[0], email }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id, role, name: email.split('@')[0], email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ accessToken: token, refreshToken, user: { id, name: email.split('@')[0], email, role: role === 'provider' ? 'SERVICE_PROVIDER' : role === 'admin' ? 'ADMIN' : 'CUSTOMER' } });
});

app.post('/api/auth/register', (req, res) => {
  const { email, role } = req.body;
  
  let id = `${role}-123`;
  if (role === 'provider' || role === 'SERVICE_PROVIDER') {
    const provider = providersDb.find(p => p.email && String(p.email).toLowerCase() === String(email).toLowerCase());
    if (provider) {
      id = provider.id;
    }
  }
  
  const token = jwt.sign({ id, role: role.toLowerCase(), name: email.split('@')[0], email }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id, role: role.toLowerCase(), name: email.split('@')[0], email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ accessToken: token, refreshToken, user: { id, name: email.split('@')[0], email, role: role === 'provider' ? 'SERVICE_PROVIDER' : role === 'admin' ? 'ADMIN' : 'CUSTOMER' } });
});

// Protect specific routes

// For GET /api/customer/profile, we need to let it pass through to the existing mock endpoint OR return 404 to let axios fallback

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const upload = multer({ dest: 'uploads/profile-images/' });

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

app.get('/api/customer/profile', JWTMiddleware, RoleMiddleware(['customer', 'admin']), (req, res) => {
  res.json(customerProfile);
});

app.put('/api/customer/profile', JWTMiddleware, RoleMiddleware(['customer', 'admin']), (req, res) => {
  customerProfile = { ...customerProfile, ...req.body };
  res.json(customerProfile);
});

app.post('/api/customer/profile/image', JWTMiddleware, RoleMiddleware(['customer', 'admin']), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // Use relative URL to be served by express static
  const url = `/uploads/profile-images/${req.file.filename}`;
  customerProfile.profileImage = url;
  res.json({ imageUrl: url, message: "Profile image uploaded successfully" });
});

app.put('/api/customer/change-password', JWTMiddleware, RoleMiddleware(['customer', 'admin']), (req, res) => {
  res.json({ message: "Password changed successfully" });
});


// Mock database for location tracking
const activeLocations = new Map<string, { lat: number, lng: number, timestamp: number }>();

app.post('/api/bookings/:id/location', (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;
  activeLocations.set(id, { lat: latitude, lng: longitude, timestamp: Date.now() });
  res.json({ success: true });
});

app.get('/api/bookings/:id/location', (req, res) => {
  const { id } = req.params;
  const loc = activeLocations.get(id);
  if (loc) {
    res.json({ latitude: loc.lat, longitude: loc.lng });
  } else {
    // Return a mock default if not started yet (e.g. Bangalore coordinates)
    res.json({ latitude: 12.9716, longitude: 77.5946 }); 
  }
});

// Helper to construct the OAuth provider URL

// API Path Protections
app.get('/api/customer/bookings', JWTMiddleware, RoleMiddleware(['customer', 'admin']), (req, res) => {
  res.json(bookingsDb.filter(b => b.customerId === (req as any).user.id));
});

app.patch('/api/bookings/:id/status', JWTMiddleware, (req, res) => {
  const { status } = req.query;
  const booking = bookingsDb.find(b => b.bookingId === req.params.id || b.id === req.params.id);
  if (booking) {
    booking.status = (typeof status === 'string' ? status : '').toUpperCase();
    io.emit('booking_status_update', booking);
    io.emit('booking_status_updated', booking);
    res.json({ success: true, booking });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.use('/api/customer/*', JWTMiddleware, RoleMiddleware(['customer']));
app.use('/api/provider/*', JWTMiddleware, RoleMiddleware(['provider']));
app.use('/api/admin/*', JWTMiddleware, RoleMiddleware(['admin']));

app.get('/api/auth/url', (req, res) => {
  // Use the origin from the headers to build the redirect URI
  const origin = req.headers.origin || req.headers.referer || `https://${req.headers.host}`;
  const redirectUri = `${origin}/auth/callback`.replace(/([^:]\/)\/+/g, "$1"); // ensure no double slashes

  const params = new URLSearchParams({
    client_id: process.env.OAUTH_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const origin = req.protocol + '://' + req.get('host');
  const redirectUri = `${origin}/auth/callback`;

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const tokens = tokenResponse.data;
    
    // In a real app, you would exchange the tokens or get user info here
    // For this example, we just signal success
    
    // Fetch user info with the access token
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });
    
    const userData = userResponse.data;

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS',
                payload: ${JSON.stringify(userData)}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.status(500).send('Authentication failed');
  }
});


// --- Provider APIs ---
app.get('/api/provider/dashboard', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({
    totalRequests: 5,
    pendingRequests: 2,
    acceptedJobs: 3,
    completedJobs: 15,
    todayEarnings: 2500,
    weeklyEarnings: 15000,
    monthlyEarnings: 45000,
    rating: 4.8,
    isOnline: true
  });
});

app.get('/api/provider/requests', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { res.json(bookingsDb.filter(b => b.providerId === (req as any).user.id && b.status === 'PENDING')); });

app.get('/api/provider/bookings', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { res.json(bookingsDb.filter(b => b.providerId === (req as any).user.id)); });

app.post('/api/provider/request/:id/accept', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { const booking = bookingsDb.find(b => b.bookingId === req.params.id || b.id === req.params.id); if (booking) { booking.status = 'ACCEPTED'; io.emit('booking_status_update', booking); io.emit('booking_status_updated', booking); res.json({ success: true, booking }); } else { res.status(404).json({ error: 'Not found' }); } });


app.post('/api/provider/request/:id/reject', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => { const booking = bookingsDb.find(b => b.bookingId === req.params.id || b.id === req.params.id); if (booking) { booking.status = 'REJECTED'; io.emit('booking_status_update', booking); io.emit('booking_status_updated', booking); res.json({ success: true, booking }); } else { res.status(404).json({ error: 'Not found' }); } });


app.get('/api/provider/ongoing', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/completed', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/earnings', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({
    today: 2500,
    weekly: 15000,
    monthly: 45000,
    total: 120000,
    history: []
  });
});

app.put('/api/provider/profile', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, message: 'Profile updated' });
});

app.put('/api/provider/location', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, message: 'Location updated' });
});

app.put('/api/provider/availability', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json({ success: true, isOnline: req.body.isOnline });
});

app.get('/api/provider/notifications', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});

app.get('/api/provider/reviews', JWTMiddleware, RoleMiddleware(['provider']), (req, res) => {
  res.json([]);
});


// Database variables are declared at the top of the file

function seedProviders() {
  if (providersDb.length === 0) {
    const list = [
      {
        id: 'prov_1',
        fullName: 'Home Cleaner',
        email: 'demo0@provider.com',
        phone: '+919876543210',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', // Female avatar
        serviceImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop', // cleaning staff
        serviceCategory: 'cleaning',
        experience: '5 Years',
        rating: 4.8,
        address: '123 Tech Park, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        availability: 'ONLINE',
        verified: true,
        price: 300,
        description: 'Professional deep home cleaning services, sanitization, and dust removal with eco-friendly products.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_2',
        fullName: 'Electrician',
        email: 'demo1@provider.com',
        phone: '+919876543211',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop', // electrical repair
        serviceCategory: 'repairs',
        experience: '4 Years',
        rating: 4.5,
        address: '456 Ring Road, Bangalore',
        latitude: 12.9816,
        longitude: 77.6046,
        availability: 'ONLINE',
        verified: true,
        price: 350,
        description: 'Expert electrical repair, smart appliance setup, wiring fixes, and home safety checks.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_3',
        fullName: 'Salon Expert',
        email: 'demo2@provider.com',
        phone: '+919876543212',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Female avatar
        serviceImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop', // beautician
        serviceCategory: 'salon',
        experience: '6 Years',
        rating: 4.9,
        address: '789 MG Road, Bangalore',
        latitude: 12.9616,
        longitude: 77.5846,
        availability: 'ONLINE',
        verified: true,
        price: 600,
        description: 'Luxury salon, facials, herbal massages, bridal grooming, and hair treatments in the comfort of your home.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_4',
        fullName: 'Tutor',
        email: 'demo3@provider.com',
        phone: '+919876543213',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', // Female avatar
        serviceImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop', // teacher
        serviceCategory: 'tutoring',
        experience: '3 Years',
        rating: 4.6,
        address: '101 Residency Road, Bangalore',
        latitude: 12.9516,
        longitude: 77.5746,
        availability: 'ONLINE',
        verified: true,
        price: 450,
        description: 'Interactive home tutoring and academic guidance in Mathematics, Physics, Chemistry, and Languages.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_5',
        fullName: 'Painter',
        email: 'demo4@provider.com',
        phone: '+919876543214',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop', // wall painter
        serviceCategory: 'painting',
        experience: '7 Years',
        rating: 4.7,
        address: '202 Indiranagar, Bangalore',
        latitude: 12.9916,
        longitude: 77.6146,
        availability: 'ONLINE',
        verified: true,
        price: 500,
        description: 'Professional wall painters providing premium texture consultation, wallpaper assembly, and flawless finishing.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_6',
        fullName: 'Gardener',
        email: 'demo5@provider.com',
        phone: '+919876543215',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop', // gardener
        serviceCategory: 'gardening',
        experience: '4 Years',
        rating: 4.4,
        address: '303 Koramangala, Bangalore',
        latitude: 12.9316,
        longitude: 77.6246,
        availability: 'ONLINE',
        verified: true,
        price: 300,
        description: 'Expert garden landscaping, plant care, organic lawn mowing, weeding, and soil nourishment.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_7',
        fullName: 'Plumber',
        email: 'demo6@provider.com',
        phone: '+919876543216',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop', // plumbing repair
        serviceCategory: 'repairs',
        experience: '5 Years',
        rating: 4.8,
        address: '404 Jayanagar, Bangalore',
        latitude: 12.9216,
        longitude: 77.5946,
        availability: 'ONLINE',
        verified: true,
        price: 400,
        description: 'Reliable plumbing diagnostics, drainage cleaning, kitchen pipeline fixes, and water pump repair.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_8',
        fullName: 'Carpenter',
        email: 'demo7@provider.com',
        phone: '+919876543217',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop', // woodworking
        serviceCategory: 'repairs',
        experience: '8 Years',
        rating: 4.7,
        address: '505 Whitefield, Bangalore',
        latitude: 12.9616,
        longitude: 77.6446,
        availability: 'ONLINE',
        verified: true,
        price: 450,
        description: 'Precision woodworking, furniture repair, wooden door installation, and customized modular cabinet fixtures.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_9',
        fullName: 'AC Technician',
        email: 'demo8@provider.com',
        phone: '+919876543218',
        profileImage: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&auto=format&fit=crop', // air conditioner service
        serviceCategory: 'repairs',
        experience: '6 Years',
        rating: 4.9,
        address: '606 Electronic City, Bangalore',
        latitude: 12.8516,
        longitude: 77.6646,
        availability: 'ONLINE',
        verified: true,
        price: 500,
        description: 'Proactive air conditioner servicing, filter cleaning, refrigerant level top-up, and AC circuit repair.',
        role: 'PROVIDER'
      },
      {
        id: 'prov_10',
        fullName: 'Mechanic',
        email: 'demo9@provider.com',
        phone: '+919876543219',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Male avatar
        serviceImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop', // car mechanic
        serviceCategory: 'repairs',
        experience: '10 Years',
        rating: 4.9,
        address: '707 HSR Layout, Bangalore',
        latitude: 12.9116,
        longitude: 77.6346,
        availability: 'ONLINE',
        verified: true,
        price: 550,
        description: 'Instant roadside assistance, vehicle diagnostics, engine tuning, oil refills, and battery fixes.',
        role: 'PROVIDER'
      }
    ];
    providersDb.push(...list);
  }
}
seedProviders();

// Packages Database setup (persistent JSON file mimicking MySQL structure)
const PACKAGES_FILE = path.join(process.cwd(), 'packages_db.json');
let packagesDb: any[] = [];

function loadPackages() {
  try {
    if (fs.existsSync(PACKAGES_FILE)) {
      const data = fs.readFileSync(PACKAGES_FILE, 'utf-8');
      packagesDb = JSON.parse(data);
    } else {
      packagesDb = [];
      seedDefaultPackages();
      savePackages();
    }
  } catch (err) {
    console.error('Failed to load packages:', err);
    packagesDb = [];
  }
}

function savePackages() {
  try {
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify(packagesDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save packages:', err);
  }
}

function seedDefaultPackages() {
  providersDb.forEach(p => {
    packagesDb.push({
      package_id: 'pkg_srv_' + p.id,
      provider_id: p.id,
      provider_name: p.fullName,
      service_title: p.fullName + ' Service',
      category: p.serviceCategory,
      price: p.price,
      duration: '1-2 Hours',
      description: p.description,
      features: ['Verified Professional', 'Quality Service Guarantee'],
      image_url: p.serviceImage || p.profileImage,
      availability_status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });
}

function syncProvidersWithPackages() {
  packagesDb.forEach(pkg => {
    if (pkg.availability_status === 'ACTIVE') {
      let provider = providersDb.find(p => p.id === pkg.provider_id);
      if (!provider) {
        provider = {
          id: pkg.provider_id,
          fullName: pkg.provider_name,
          email: 'demo@provider.com',
          phone: '+919876543210',
          profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          serviceImage: pkg.image_url,
          serviceCategory: pkg.category,
          experience: '5 Years',
          rating: 4.8,
          address: '123 Tech Park, Bangalore',
          latitude: 12.9716,
          longitude: 77.5946,
          availability: 'ONLINE',
          verified: true,
          price: pkg.price,
          description: pkg.description,
          role: 'PROVIDER'
        };
        providersDb.push(provider);
      } else {
        provider.serviceCategory = pkg.category;
        provider.price = pkg.price;
        provider.description = pkg.description;
        provider.serviceImage = pkg.image_url;
      }
    }
  });
}

loadPackages();
syncProvidersWithPackages();

app.get('/api/providers', (req, res) => {
  res.json(providersDb);
});

app.get('/api/providers/category/:category', (req, res) => {
  const { category } = req.params;
  const filtered = category === 'all' ? providersDb : providersDb.filter(p => p.serviceCategory === category);
  res.json(filtered);
});

app.get('/api/providers/servicehub', (req, res) => {
  res.json(providersDb.filter(p => p.availability === 'ONLINE'));
});

app.post('/api/bookings', JWTMiddleware, (req, res) => {
  const user = (req as any).user;
  const bookingId = 'bk_' + Date.now();
  const provId = req.body.providerId || req.body.provider_id;
  let provider = providersDb.find(p => String(p.id) === String(provId));

  if (!provider) {
    const pkg = packagesDb.find(p => String(p.provider_id) === String(provId));
    if (pkg) {
      provider = {
        id: pkg.provider_id,
        fullName: pkg.provider_name,
        email: 'demo@provider.com',
        phone: '+919876543210',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        serviceImage: pkg.image_url,
        serviceCategory: pkg.category,
        experience: '5 Years',
        rating: 4.8,
        address: '123 Tech Park, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        availability: 'ONLINE',
        verified: true,
        price: pkg.price,
        description: pkg.description,
        role: 'PROVIDER'
      };
      providersDb.push(provider);
    }
  }

  const newBooking = {
    id: bookingId,
    booking_id: bookingId,
    bookingId: bookingId,

    customerId: user?.id || req.body.customerId || '',
    customer_id: user?.id || req.body.customer_id || '',
    customerName: req.body.customerName || user?.name || 'Customer',
    customer_name: req.body.customer_name || user?.name || 'Customer',
    customerPhone: req.body.customerPhone || req.body.customer_phone || user?.phone || '',
    customer_phone: req.body.customer_phone || req.body.customer_phone || user?.phone || '',
    customerAvatar: user?.avatar || user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',

    providerId: provId || '',
    provider_id: provId || '',
    providerName: req.body.providerName || provider?.fullName || 'Provider',
    provider_name: req.body.provider_name || provider?.fullName || 'Provider',
    providerAvatar: provider?.profileImage || provider?.serviceImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    providerPhone: provider?.phone || '',
    provider_phone: provider?.phone || '',

    serviceId: req.body.serviceId || req.body.service_id || '',
    service_id: req.body.serviceId || req.body.service_id || '',
    serviceTitle: req.body.serviceTitle || req.body.service_name || provider?.fullName || 'Service',
    service_name: req.body.serviceTitle || req.body.service_name || provider?.fullName || 'Service',
    categoryName: req.body.category || req.body.categoryName || req.body.service_category || provider?.serviceCategory || 'cleaning',
    service_category: req.body.category || req.body.categoryName || req.body.service_category || provider?.serviceCategory || 'cleaning',

    address: req.body.address || req.body.service_address || user?.address || '',
    service_address: req.body.address || req.body.service_address || user?.address || '',
    latitude: Number(req.body.latitude || user?.latitude || 12.9716),
    longitude: Number(req.body.longitude || user?.longitude || 77.5946),

    bookingDate: req.body.bookingDate || req.body.date || '',
    bookingTime: req.body.bookingTime || req.body.time || '',
    scheduled_time: `${req.body.bookingDate || req.body.date || ''} ${req.body.bookingTime || req.body.time || ''}`.trim(),
    booking_time: new Date().toISOString(),

    totalPrice: Number(req.body.totalPrice || req.body.estimated_price || provider?.price || 0),
    estimated_price: Number(req.body.totalPrice || req.body.estimated_price || provider?.price || 0),

    status: 'Pending',
    paymentStatus: 'Pending',
    payment_status: 'Pending',

    notes: req.body.notes || '',

    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  bookingsDb.push(newBooking);

  // Emit Real-time Socket Events
  io.to('providers').emit('incoming_booking', newBooking);
  io.emit('booking_created', newBooking);
  io.emit('booking_status_update', newBooking);
  io.emit('booking_status_updated', newBooking);

  res.json(newBooking);
});

app.post('/api/bookings/create', JWTMiddleware, (req, res) => {
  const user = (req as any).user;
  const bookingId = 'bk_' + Date.now();
  const provId = req.body.providerId || req.body.provider_id;
  let provider = providersDb.find(p => String(p.id) === String(provId));

  if (!provider) {
    const pkg = packagesDb.find(p => String(p.provider_id) === String(provId));
    if (pkg) {
      provider = {
        id: pkg.provider_id,
        fullName: pkg.provider_name,
        email: 'demo@provider.com',
        phone: '+919876543210',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        serviceImage: pkg.image_url,
        serviceCategory: pkg.category,
        experience: '5 Years',
        rating: 4.8,
        address: '123 Tech Park, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        availability: 'ONLINE',
        verified: true,
        price: pkg.price,
        description: pkg.description,
        role: 'PROVIDER'
      };
      providersDb.push(provider);
    }
  }

  const customerLatitude = Number(req.body.customerLatitude || req.body.latitude || user?.latitude || 12.9716);
  const customerLongitude = Number(req.body.customerLongitude || req.body.longitude || user?.longitude || 77.5946);
  const providerLatitude = provider ? Number(provider.latitude || 12.9716) : 12.9716;
  const providerLongitude = provider ? Number(provider.longitude || 77.5946) : 77.5946;

  const newBooking = {
    id: bookingId,
    booking_id: bookingId,
    bookingId: bookingId,

    customerId: user?.id || req.body.customerId || '',
    customer_id: user?.id || req.body.customerId || '',
    customerName: req.body.customerName || user?.name || 'Customer',
    customer_name: req.body.customerName || user?.name || 'Customer',
    customerPhone: req.body.customerPhone || user?.phone || '',
    customer_phone: req.body.customerPhone || user?.phone || '',
    customerAvatar: user?.avatar || user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',

    providerId: provId || '',
    provider_id: provId || '',
    providerName: req.body.providerName || provider?.fullName || 'Provider',
    provider_name: req.body.providerName || provider?.fullName || 'Provider',
    providerAvatar: provider?.profileImage || provider?.serviceImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    providerPhone: provider?.phone || '',
    provider_phone: provider?.phone || '',

    serviceId: req.body.serviceId || req.body.service_id || '',
    service_id: req.body.serviceId || req.body.service_id || '',
    serviceTitle: req.body.serviceTitle || req.body.service_name || provider?.fullName || 'Service',
    service_name: req.body.serviceTitle || req.body.service_name || provider?.fullName || 'Service',
    categoryName: req.body.category || req.body.categoryName || req.body.service_category || provider?.serviceCategory || 'cleaning',
    service_category: req.body.category || req.body.categoryName || req.body.service_category || provider?.serviceCategory || 'cleaning',

    bookingAddress: req.body.bookingAddress || req.body.address || req.body.service_address || user?.address || '',
    address: req.body.bookingAddress || req.body.address || req.body.service_address || user?.address || '',
    service_address: req.body.bookingAddress || req.body.address || req.body.service_address || user?.address || '',
    customerLatitude,
    latitude: customerLatitude,
    customerLongitude,
    longitude: customerLongitude,
    providerLatitude,
    providerLongitude,

    bookingDate: req.body.bookingDate || req.body.date || '',
    date: req.body.bookingDate || req.body.date || '',
    bookingTime: req.body.bookingTime || req.body.time || '',
    time: req.body.bookingTime || req.body.time || '',
    scheduled_time: `${req.body.bookingDate || req.body.date || ''} ${req.body.bookingTime || req.body.time || ''}`.trim(),
    booking_time: new Date().toISOString(),

    estimatedPrice: Number(req.body.estimatedPrice || req.body.totalPrice || req.body.estimated_price || provider?.price || 0),
    estimated_price: Number(req.body.estimatedPrice || req.body.totalPrice || req.body.estimated_price || provider?.price || 0),
    totalPrice: Number(req.body.estimatedPrice || req.body.totalPrice || req.body.estimated_price || provider?.price || 0),

    status: 'Pending',
    paymentStatus: 'Pending',
    payment_status: 'Pending',

    notes: req.body.notes || '',

    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  bookingsDb.push(newBooking);

  // Emit Real-time Socket Events
  io.to('providers').emit('incoming_booking', newBooking);
  io.emit('booking_created', newBooking);
  io.emit('booking_status_update', newBooking);
  io.emit('booking_status_updated', newBooking);

  res.json(newBooking);
});

app.get('/api/bookings/provider/:id', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const providerId = req.params.id;

  if (requestingUser.role !== 'admin' && String(requestingUser.id) !== String(providerId)) {
    return res.status(403).json({ error: 'Forbidden: You cannot view bookings for this provider' });
  }

  const list = bookingsDb.filter(b => String(b.providerId) === String(providerId) || String(b.provider_id) === String(providerId));
  res.json(list);
});

app.get('/api/bookings/customer/:id', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const customerId = req.params.id;

  if (requestingUser.role !== 'admin' && String(requestingUser.id) !== String(customerId)) {
    return res.status(403).json({ error: 'Forbidden: You cannot view bookings for this customer' });
  }

  const list = bookingsDb.filter(b => String(b.customerId) === String(customerId) || String(b.customer_id) === String(customerId));
  res.json(list);
});

app.get('/api/bookings/:bookingId', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const { bookingId } = req.params;

  const booking = bookingsDb.find(b => String(b.id) === String(bookingId) || String(b.bookingId) === String(bookingId) || String(b.booking_id) === String(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isOwner = requestingUser.role === 'admin' ||
    String(booking.customerId) === String(requestingUser.id) ||
    String(booking.customer_id) === String(requestingUser.id) ||
    String(booking.providerId) === String(requestingUser.id) ||
    String(booking.provider_id) === String(requestingUser.id);

  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to view this booking' });
  }

  res.json(booking);
});

app.put('/api/bookings/:bookingId/accept', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const { bookingId } = req.params;

  const booking = bookingsDb.find(b => String(b.id) === String(bookingId) || String(b.bookingId) === String(bookingId) || String(b.booking_id) === String(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isAssignedProvider = requestingUser.role === 'admin' ||
    String(booking.providerId) === String(requestingUser.id) ||
    String(booking.provider_id) === String(requestingUser.id);

  if (!isAssignedProvider) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this booking' });
  }

  booking.status = 'Accepted';
  booking.acceptedTime = new Date().toISOString();
  booking.accepted_at = new Date().toISOString();
  booking.providerCurrentLocation = { latitude: 12.9716, longitude: 77.5946 };
  booking.provider_current_location = { latitude: 12.9716, longitude: 77.5946 };
  booking.estimatedArrivalTime = '15 mins';
  booking.estimated_arrival_time = '15 mins';
  booking.updated_at = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();

  io.emit('booking_status_update', booking);
  io.emit('booking_status_updated', booking);
  io.emit('booking_accepted', booking);

  res.json(booking);
});

app.put('/api/bookings/:bookingId/reject', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const { bookingId } = req.params;

  const booking = bookingsDb.find(b => String(b.id) === String(bookingId) || String(b.bookingId) === String(bookingId) || String(b.booking_id) === String(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isAssignedProvider = requestingUser.role === 'admin' ||
    String(booking.providerId) === String(requestingUser.id) ||
    String(booking.provider_id) === String(requestingUser.id);

  if (!isAssignedProvider) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this booking' });
  }

  booking.status = 'Rejected';
  booking.rejectedTime = new Date().toISOString();
  booking.rejection_reason = req.body.reason || 'Declined by provider';
  booking.updated_at = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();

  io.emit('booking_status_update', booking);
  io.emit('booking_status_updated', booking);
  io.emit('booking_rejected', booking);

  res.json(booking);
});

app.put('/api/bookings/:bookingId/start', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const { bookingId } = req.params;

  const booking = bookingsDb.find(b => String(b.id) === String(bookingId) || String(b.bookingId) === String(bookingId) || String(b.booking_id) === String(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isAssignedProvider = requestingUser.role === 'admin' ||
    String(booking.providerId) === String(requestingUser.id) ||
    String(booking.provider_id) === String(requestingUser.id);

  if (!isAssignedProvider) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this booking' });
  }

  booking.status = 'Ongoing';
  booking.updated_at = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();

  io.emit('booking_status_update', booking);
  io.emit('booking_status_updated', booking);
  io.emit('booking_started', booking);

  res.json(booking);
});

app.put('/api/bookings/:bookingId/complete', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const { bookingId } = req.params;

  const booking = bookingsDb.find(b => String(b.id) === String(bookingId) || String(b.bookingId) === String(bookingId) || String(b.booking_id) === String(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isAssignedProvider = requestingUser.role === 'admin' ||
    String(booking.providerId) === String(requestingUser.id) ||
    String(booking.provider_id) === String(requestingUser.id);

  if (!isAssignedProvider) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this booking' });
  }

  booking.status = 'Completed';
  booking.completedTime = new Date().toISOString();
  booking.paymentStatus = 'Paid';
  booking.payment_status = 'Paid';
  booking.updated_at = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();

  io.emit('booking_status_update', booking);
  io.emit('booking_status_updated', booking);
  io.emit('booking_completed', booking);

  res.json(booking);
});

app.put('/api/bookings/:bookingId/cancel', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const { bookingId } = req.params;

  const booking = bookingsDb.find(b => String(b.id) === String(bookingId) || String(b.bookingId) === String(bookingId) || String(b.booking_id) === String(bookingId));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isOwnerCustomer = requestingUser.role === 'admin' ||
    String(booking.customerId) === String(requestingUser.id) ||
    String(booking.customer_id) === String(requestingUser.id);

  if (!isOwnerCustomer) {
    return res.status(403).json({ error: 'Forbidden: You cannot cancel this booking' });
  }

  const allowedStatus = ['pending', 'searching', 'accepted'].includes(String(booking.status).toLowerCase());
  if (!allowedStatus) {
    return res.status(400).json({ error: 'Bad Request: Booking cannot be cancelled at this stage' });
  }

  booking.status = 'Cancelled';
  booking.updated_at = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();

  io.emit('booking_status_update', booking);
  io.emit('booking_status_updated', booking);
  io.emit('booking_cancelled', booking);

  res.json(booking);
});

app.patch('/api/providers/location', JWTMiddleware, (req, res) => {
  const { id, latitude, longitude } = req.body;
  const p = providersDb.find(x => x.id === id);
  if (p) {
    p.latitude = latitude;
    p.longitude = longitude;
    io.emit('provider_location_update', { id, latitude, longitude });
    res.json(p);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// --- Additional API Mocking to prevent 404 errors during Sync & Actions ---

// Services & Categories
app.get('/api/services', (req, res) => {
  const categoryNameMap: Record<string, string> = {
    cleaning: 'Home Cleaning',
    repairs: 'Home Repairs',
    salon: 'Salon & Spa',
    tutoring: 'Tutoring',
    painting: 'Painting & Decor',
    gardening: 'Lawn & Garden'
  };

  const { category } = req.query;

  let filteredPackages = packagesDb.filter(pkg => {
    const isPackageActive = pkg.availability_status === 'ACTIVE';
    // Find the provider in providersDb
    const provider = providersDb.find(p => p.id === pkg.provider_id);
    const isProviderOnline = provider ? provider.availability === 'ONLINE' : true;
    return isPackageActive && isProviderOnline;
  });

  if (category && category !== 'all') {
    const categoryLower = String(category).toLowerCase().trim();
    filteredPackages = filteredPackages.filter(pkg => {
      const catId = pkg.category.toLowerCase().trim();
      const catName = (categoryNameMap[pkg.category] || '').toLowerCase().trim();
      return catId === categoryLower || catName === categoryLower;
    });
  }

  const mapped = filteredPackages.map(pkg => {
    const provider = providersDb.find(p => p.id === pkg.provider_id);
    return {
      id: pkg.package_id,
      package_id: pkg.package_id,
      title: pkg.service_title,
      name: pkg.service_title,
      categoryId: pkg.category,
      categoryName: categoryNameMap[pkg.category] || (pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)),
      providerId: pkg.provider_id,
      providerName: pkg.provider_name,
      providerAvatar: provider?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      providerRating: provider?.rating || 4.8,
      rating: provider?.rating || 4.8,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      reviewCount: 15,
      location: provider?.address || 'Bangalore',
      images: [pkg.image_url],
      features: Array.isArray(pkg.features) ? pkg.features : ['Verified Professional', 'Quality Service Guarantee']
    };
  });

  res.json(mapped);
});

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'cleaning', name: 'Home Cleaning', icon: 'Sparkles', description: 'Deep cleaning, kitchen cleaning, sofa cleaning, and disinfection.', serviceCount: 24 },
    { id: 'repairs', name: 'Home Repairs', icon: 'Wrench', description: 'Expert plumbers, electricians, carpenters, and appliance repair.', serviceCount: 42 },
    { id: 'salon', name: 'Salon & Spa', icon: 'Smile', description: 'Haircuts, facials, massages, and grooming at home.', serviceCount: 18 },
    { id: 'tutoring', name: 'Tutoring', icon: 'BookOpen', description: 'Math, Science, Languages, and Music tutoring at home.', serviceCount: 15 },
    { id: 'painting', name: 'Painting & Decor', icon: 'Paintbrush', description: 'Professional wall painters, consultants, and wallpaper experts.', serviceCount: 12 },
    { id: 'gardening', name: 'Lawn & Garden', icon: 'Flower', description: 'Lawn mowing, landscaping, plant care, and pest control.', serviceCount: 15 }
  ];
  res.json(categories);
});

// Notifications
let notificationsDb = [
  {
    id: 'n_1',
    userId: 'customer-123',
    title: 'Welcome to ServiceHub!',
    message: 'Thanks for signing up. Find the best service providers near you.',
    read: false,
    createdAt: new Date().toISOString(),
    type: 'system'
  }
];

app.get('/api/notifications', JWTMiddleware, (req, res) => {
  res.json({ content: notificationsDb });
});

app.get('/api/notifications/unread-count', JWTMiddleware, (req, res) => {
  const count = notificationsDb.filter(n => !n.read).length;
  res.json({ count });
});

app.put('/api/notifications/read/:id', JWTMiddleware, (req, res) => {
  const notif = notificationsDb.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

app.put('/api/notifications/read-all', JWTMiddleware, (req, res) => {
  notificationsDb.forEach(n => n.read = true);
  res.json({ success: true });
});

app.delete('/api/notifications/:id', JWTMiddleware, (req, res) => {
  notificationsDb = notificationsDb.filter(n => n.id !== req.params.id);
  res.json({ success: true });
});

app.delete('/api/notifications/clear-all', JWTMiddleware, (req, res) => {
  notificationsDb = [];
  res.json({ success: true });
});

// Favorites
let favoritesDb: any[] = [];
app.get('/api/customer/favorites', JWTMiddleware, (req, res) => {
  res.json(favoritesDb);
});

app.post('/api/customer/favorites/:id', JWTMiddleware, (req, res) => {
  const { id } = req.params;
  if (!favoritesDb.some(f => f.serviceId === id || f.id === id)) {
    favoritesDb.push({ id, serviceId: id });
  }
  res.json({ success: true, favorites: favoritesDb });
});

app.delete('/api/customer/favorites/:id', JWTMiddleware, (req, res) => {
  const { id } = req.params;
  favoritesDb = favoritesDb.filter(f => f.serviceId !== id && f.id !== id);
  res.json({ success: true, favorites: favoritesDb });
});

// Addresses
let addressesDb = [
  {
    id: 1,
    name: 'Home',
    address: '123 Main St, Bangalore, India',
    city: 'Bangalore',
    zipCode: '560001'
  }
];

app.get('/api/customer/addresses', JWTMiddleware, (req, res) => {
  res.json(addressesDb);
});

app.post('/api/customer/address', JWTMiddleware, (req, res) => {
  const newAddr = {
    id: Date.now(),
    ...req.body
  };
  addressesDb.push(newAddr);
  res.json(newAddr);
});

app.put('/api/customer/address/:id', JWTMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const idx = addressesDb.findIndex(a => a.id === id);
  if (idx !== -1) {
    addressesDb[idx] = { ...addressesDb[idx], ...req.body };
    res.json(addressesDb[idx]);
  } else {
    res.status(404).json({ error: 'Address not found' });
  }
});

app.delete('/api/customer/address/:id', JWTMiddleware, (req, res) => {
  const id = Number(req.params.id);
  addressesDb = addressesDb.filter(a => a.id !== id);
  res.json({ success: true });
});

// Services (Customer specific)
app.get('/api/customer/services', JWTMiddleware, (req, res) => {
  const categoryNameMap: Record<string, string> = {
    cleaning: 'Home Cleaning',
    repairs: 'Home Repairs',
    salon: 'Salon & Spa',
    tutoring: 'Tutoring',
    painting: 'Painting & Decor',
    gardening: 'Lawn & Garden'
  };
  const services = providersDb.map(p => ({
    id: 'srv_' + p.id,
    title: p.fullName + ' Service',
    name: p.fullName + ' Service',
    categoryId: p.serviceCategory,
    categoryName: categoryNameMap[p.serviceCategory] || (p.serviceCategory.charAt(0).toUpperCase() + p.serviceCategory.slice(1)),
    providerId: p.id,
    providerName: p.fullName,
    providerAvatar: p.profileImage,
    providerRating: p.rating,
    description: p.description,
    price: p.price,
    duration: '1-2 Hours',
    rating: p.rating,
    reviewCount: 15,
    location: p.address,
    images: [p.serviceImage || p.profileImage],
    features: ['Verified Professional', 'Quality Service Guarantee']
  }));
  res.json(services);
});

app.get('/api/customer/services/:id', JWTMiddleware, (req, res) => {
  const id = req.params.id.replace('srv_', '');
  const p = providersDb.find(x => x.id === id || x.id === 'prov_' + id);
  if (p) {
    const categoryNameMap: Record<string, string> = {
      cleaning: 'Home Cleaning',
      repairs: 'Home Repairs',
      salon: 'Salon & Spa',
      tutoring: 'Tutoring',
      painting: 'Painting & Decor',
      gardening: 'Lawn & Garden'
    };
    res.json({
      id: 'srv_' + p.id,
      title: p.fullName + ' Service',
      categoryId: p.serviceCategory,
      categoryName: categoryNameMap[p.serviceCategory] || (p.serviceCategory.charAt(0).toUpperCase() + p.serviceCategory.slice(1)),
      providerId: p.id,
      providerName: p.fullName,
      providerAvatar: p.profileImage,
      providerRating: p.rating,
      description: p.description,
      price: p.price,
      duration: '1-2 Hours',
      rating: p.rating,
      reviewCount: 15,
      location: p.address,
      images: [p.serviceImage || p.profileImage],
      features: ['Verified Professional', 'Quality Service Guarantee']
    });
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

app.get('/api/customer/dashboard', JWTMiddleware, (req, res) => {
  res.json({
    totalBookings: bookingsDb.filter(b => b.customerId === (req as any).user.id).length,
    activeBookings: bookingsDb.filter(b => b.customerId === (req as any).user.id && !['completed', 'cancelled', 'rejected'].includes(b.status.toLowerCase())).length,
    totalSpent: bookingsDb.filter(b => b.customerId === (req as any).user.id && b.status.toLowerCase() === 'completed').reduce((sum, b) => sum + (b.totalPrice || b.price || 0), 0),
    favoritesCount: favoritesDb.length
  });
});

app.post('/api/customer/bookings', JWTMiddleware, (req, res) => {
  const user = (req as any).user;
  const bookingId = 'bk_' + Date.now();
  const provId = req.body.providerId || req.body.provider_id;
  let provider = providersDb.find(p => String(p.id) === String(provId));

  if (!provider) {
    const pkg = packagesDb.find(p => String(p.provider_id) === String(provId));
    if (pkg) {
      provider = {
        id: pkg.provider_id,
        fullName: pkg.provider_name,
        email: 'demo@provider.com',
        phone: '+919876543210',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        serviceImage: pkg.image_url,
        serviceCategory: pkg.category,
        experience: '5 Years',
        rating: 4.8,
        address: '123 Tech Park, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        availability: 'ONLINE',
        verified: true,
        price: pkg.price,
        description: pkg.description,
        role: 'PROVIDER'
      };
      providersDb.push(provider);
    }
  }

  const customerLatitude = Number(req.body.customerLatitude || req.body.latitude || user?.latitude || 12.9716);
  const customerLongitude = Number(req.body.customerLongitude || req.body.longitude || user?.longitude || 77.5946);
  const providerLatitude = provider ? Number(provider.latitude || 12.9716) : 12.9716;
  const providerLongitude = provider ? Number(provider.longitude || 77.5946) : 77.5946;

  const newBooking = {
    id: bookingId,
    booking_id: bookingId,
    bookingId: bookingId,

    customerId: user?.id || req.body.customerId || '',
    customer_id: user?.id || req.body.customerId || '',
    customerName: req.body.customerName || user?.name || 'Customer',
    customer_name: req.body.customerName || user?.name || 'Customer',
    customerPhone: req.body.customerPhone || user?.phone || '',
    customer_phone: req.body.customerPhone || user?.phone || '',
    customerAvatar: user?.avatar || user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',

    providerId: provId || '',
    provider_id: provId || '',
    providerName: req.body.providerName || provider?.fullName || 'Provider',
    provider_name: req.body.providerName || provider?.fullName || 'Provider',
    providerAvatar: provider?.profileImage || provider?.serviceImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    providerPhone: provider?.phone || '',
    provider_phone: provider?.phone || '',

    serviceId: req.body.serviceId || req.body.service_id || '',
    service_id: req.body.serviceId || req.body.service_id || '',
    serviceTitle: req.body.serviceTitle || req.body.service_name || provider?.fullName || 'Service',
    service_name: req.body.serviceTitle || req.body.service_name || provider?.fullName || 'Service',
    categoryName: req.body.category || req.body.categoryName || req.body.service_category || provider?.serviceCategory || 'cleaning',
    service_category: req.body.category || req.body.categoryName || req.body.service_category || provider?.serviceCategory || 'cleaning',

    bookingAddress: req.body.bookingAddress || req.body.address || req.body.service_address || user?.address || '',
    address: req.body.bookingAddress || req.body.address || req.body.service_address || user?.address || '',
    service_address: req.body.bookingAddress || req.body.address || req.body.service_address || user?.address || '',
    customerLatitude,
    latitude: customerLatitude,
    customerLongitude,
    longitude: customerLongitude,
    providerLatitude,
    providerLongitude,

    bookingDate: req.body.bookingDate || req.body.date || '',
    date: req.body.bookingDate || req.body.date || '',
    bookingTime: req.body.bookingTime || req.body.time || '',
    time: req.body.bookingTime || req.body.time || '',
    scheduled_time: `${req.body.bookingDate || req.body.date || ''} ${req.body.bookingTime || req.body.time || ''}`.trim(),
    booking_time: new Date().toISOString(),

    estimatedPrice: Number(req.body.estimatedPrice || req.body.totalPrice || req.body.estimated_price || provider?.price || 0),
    estimated_price: Number(req.body.estimatedPrice || req.body.totalPrice || req.body.estimated_price || provider?.price || 0),
    totalPrice: Number(req.body.estimatedPrice || req.body.totalPrice || req.body.estimated_price || provider?.price || 0),

    status: 'Pending',
    paymentStatus: 'Pending',
    payment_status: 'Pending',

    notes: req.body.notes || '',

    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  bookingsDb.push(newBooking);

  // Emit Real-time Socket Events
  io.to('providers').emit('incoming_booking', newBooking);
  io.emit('booking_created', newBooking);
  io.emit('booking_status_update', newBooking);
  io.emit('booking_status_updated', newBooking);

  res.json(newBooking);
});

app.get('/api/customer/bookings/:id', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isOwner = requestingUser.role === 'admin' ||
    String(booking.customerId) === String(requestingUser.id) ||
    String(booking.customer_id) === String(requestingUser.id) ||
    String(booking.providerId) === String(requestingUser.id) ||
    String(booking.provider_id) === String(requestingUser.id);

  if (!isOwner) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to view this booking' });
  }

  res.json(booking);
});

app.put('/api/customer/bookings/cancel/:id', JWTMiddleware, (req, res) => {
  const requestingUser = (req as any).user;
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isOwnerCustomer = requestingUser.role === 'admin' ||
    String(booking.customerId) === String(requestingUser.id) ||
    String(booking.customer_id) === String(requestingUser.id);

  if (!isOwnerCustomer) {
    return res.status(403).json({ error: 'Forbidden: You cannot cancel this booking' });
  }

  const allowedStatus = ['pending', 'searching', 'accepted'].includes(String(booking.status).toLowerCase());
  if (!allowedStatus) {
    return res.status(400).json({ error: 'Bad Request: Booking cannot be cancelled at this stage' });
  }

  booking.status = 'Cancelled';
  booking.updated_at = new Date().toISOString();
  booking.updatedAt = new Date().toISOString();

  io.emit('booking_status_update', booking);
  io.emit('booking_status_updated', booking);
  io.emit('booking_cancelled', booking);

  res.json(booking);
});

app.post('/api/customer/upload-image', JWTMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `/uploads/profile-images/${req.file.filename}`;
  customerProfile.profileImage = url;
  res.json({ imageUrl: url, message: "Profile image uploaded successfully" });
});

// Reviews
let reviewsDb: any[] = [];
app.post('/api/customer/reviews', JWTMiddleware, (req, res) => {
  const newReview = {
    id: 'rev_' + Date.now(),
    customerId: (req as any).user.id,
    customerName: (req as any).user.name || 'Anonymous',
    ...req.body,
    createdAt: new Date().toISOString()
  };
  reviewsDb.push(newReview);
  res.json(newReview);
});

app.put('/api/customer/reviews/:id', JWTMiddleware, (req, res) => {
  const review = reviewsDb.find(r => r.id === req.params.id);
  if (review) {
    Object.assign(review, req.body);
    res.json(review);
  } else {
    res.status(404).json({ error: 'Review not found' });
  }
});

app.delete('/api/customer/reviews/:id', JWTMiddleware, (req, res) => {
  reviewsDb = reviewsDb.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// --- Additional Provider API Mocking ---
app.get('/api/provider/profile', JWTMiddleware, (req, res) => {
  res.json({
    id: (req as any).user.id,
    fullName: (req as any).user.name || 'Service Provider',
    email: (req as any).user.email || 'demo@provider.com',
    role: 'SERVICE_PROVIDER',
    rating: 4.8,
    isOnline: true,
    experience: '5 Years',
    phone: '+919876543210'
  });
});

app.post('/api/provider/upload-image', JWTMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ imageUrl: `/uploads/profile-images/${req.file.filename}` });
});

app.post('/api/provider/upload-document', JWTMiddleware, upload.single('file'), (req, res) => {
  res.json({ success: true, message: 'Document uploaded successfully' });
});

const handleAddEditPackage = (isEdit: boolean) => {
  return (req: any, res: any) => {
    const providerId = getActualProviderId(req.user);
    // Find provider profile
    const provider = providersDb.find(p => p.id === providerId);
    const providerName = provider?.fullName || req.user.name || 'Service Provider';

    let parsedData = req.body;
    if (typeof req.body.service === 'string') {
      try {
        parsedData = JSON.parse(req.body.service);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid service data format' });
      }
    }

    const imageUrl = req.file ? `/uploads/profile-images/${req.file.filename}` : null;

    if (isEdit) {
      const { id } = req.params;
      const pkgIdx = packagesDb.findIndex(p => p.package_id === id);
      if (pkgIdx === -1) {
        return res.status(404).json({ error: 'Package not found' });
      }
      const pkg = packagesDb[pkgIdx];
      if (pkg.provider_id !== providerId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this package' });
      }

      pkg.service_title = parsedData.service_title || parsedData.title || parsedData.name || pkg.service_title;
      pkg.category = parsedData.category || parsedData.categoryId || pkg.category;
      pkg.price = Number(parsedData.price) !== undefined && !isNaN(Number(parsedData.price)) ? Number(parsedData.price) : pkg.price;
      pkg.duration = parsedData.duration || pkg.duration;
      pkg.description = parsedData.description || pkg.description;
      pkg.features = parsedData.features || pkg.features;
      if (imageUrl) {
        pkg.image_url = imageUrl;
      }
      pkg.availability_status = parsedData.availability_status || pkg.availability_status;
      pkg.updated_at = new Date().toISOString();

      savePackages();
      syncProvidersWithPackages();
      return res.json({ success: true, package: pkg });
    } else {
      const newPackage = {
        package_id: 'pkg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        provider_id: providerId,
        provider_name: providerName,
        service_title: parsedData.service_title || parsedData.title || parsedData.name || '',
        category: String(parsedData.category || parsedData.categoryId || 'cleaning'),
        price: Number(parsedData.price) !== undefined && !isNaN(Number(parsedData.price)) ? Number(parsedData.price) : 300,
        duration: parsedData.duration || '1-2 Hours',
        description: parsedData.description || '',
        features: parsedData.features || ['Verified Professional', 'Quality Service Guarantee'],
        image_url: imageUrl || parsedData.image_url || (parsedData.images && parsedData.images[0]) || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        availability_status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      packagesDb.push(newPackage);
      savePackages();
      syncProvidersWithPackages();
      return res.json({ success: true, package: newPackage });
    }
  };
};

// Map package routes
app.post('/api/provider/packages', JWTMiddleware, upload.single('image'), handleAddEditPackage(false));
app.post('/api/provider/services', JWTMiddleware, upload.single('image'), handleAddEditPackage(false));

app.get('/api/provider/packages', JWTMiddleware, (req: any, res) => {
  const providerId = getActualProviderId(req.user);
  const list = packagesDb.filter(pkg => pkg.provider_id === providerId);
  res.json(list);
});
app.get('/api/provider/services', JWTMiddleware, (req: any, res) => {
  const providerId = getActualProviderId(req.user);
  const list = packagesDb.filter(pkg => pkg.provider_id === providerId);
  res.json(list);
});

app.get('/api/provider/packages/:id', JWTMiddleware, (req: any, res) => {
  const pkg = packagesDb.find(p => p.package_id === req.params.id);
  if (pkg) {
    res.json(pkg);
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});
app.get('/api/provider/services/:id', JWTMiddleware, (req: any, res) => {
  const pkg = packagesDb.find(p => p.package_id === req.params.id);
  if (pkg) {
    res.json(pkg);
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});

app.put('/api/provider/packages/:id', JWTMiddleware, upload.single('image'), handleAddEditPackage(true));
app.put('/api/provider/services/:id', JWTMiddleware, upload.single('image'), handleAddEditPackage(true));

app.delete('/api/provider/packages/:id', JWTMiddleware, (req: any, res) => {
  const { id } = req.params;
  const providerId = getActualProviderId(req.user);
  const pkgIdx = packagesDb.findIndex(p => p.package_id === id);
  if (pkgIdx !== -1) {
    if (packagesDb[pkgIdx].provider_id !== providerId && packagesDb[pkgIdx].provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this package' });
    }
    packagesDb.splice(pkgIdx, 1);
    savePackages();
    syncProvidersWithPackages();
    res.json({ success: true, message: 'Package deleted successfully' });
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});
app.delete('/api/provider/services/:id', JWTMiddleware, (req: any, res) => {
  const { id } = req.params;
  const providerId = getActualProviderId(req.user);
  const pkgIdx = packagesDb.findIndex(p => p.package_id === id);
  if (pkgIdx !== -1) {
    if (packagesDb[pkgIdx].provider_id !== providerId && packagesDb[pkgIdx].provider_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this package' });
    }
    packagesDb.splice(pkgIdx, 1);
    savePackages();
    syncProvidersWithPackages();
    res.json({ success: true, message: 'Package deleted successfully' });
  } else {
    res.status(404).json({ error: 'Package not found' });
  }
});

app.get('/api/provider/bookings/:id', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (booking) {
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.put('/api/provider/bookings/:id/accept', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (booking) {
    booking.status = 'Accepted';
    booking.accepted_at = new Date().toISOString();
    booking.provider_current_location = { latitude: 12.9716, longitude: 77.5946 };
    booking.estimated_arrival_time = '15 mins';
    booking.updated_at = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    io.emit('booking_status_update', booking);
    io.emit('booking_status_updated', booking);
    io.emit('booking_accepted', booking);
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.put('/api/provider/bookings/:id/reject', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (booking) {
    booking.status = 'Rejected';
    booking.rejection_reason = req.body.reason || 'Declined by provider';
    booking.updated_at = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    io.emit('booking_status_update', booking);
    io.emit('booking_status_updated', booking);
    io.emit('booking_rejected', booking);
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.put('/api/provider/bookings/:id/start', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (booking) {
    booking.status = 'Started';
    booking.updated_at = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    io.emit('booking_status_update', booking);
    io.emit('booking_status_updated', booking);
    io.emit('booking_started', booking);
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.put('/api/provider/bookings/:id/complete', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => String(b.id) === String(req.params.id) || String(b.bookingId) === String(req.params.id) || String(b.booking_id) === String(req.params.id));
  if (booking) {
    booking.status = 'Completed';
    booking.paymentStatus = 'Paid';
    booking.payment_status = 'Paid';
    booking.updated_at = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    io.emit('booking_status_update', booking);
    io.emit('booking_status_updated', booking);
    io.emit('booking_completed', booking);
    res.json(booking);
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

app.get('/api/provider/payment-history', JWTMiddleware, (req, res) => {
  res.json([]);
});

app.put('/api/provider/notifications/read/:id', JWTMiddleware, (req, res) => {
  res.json({ success: true });
});

app.delete('/api/provider/notifications/:id', JWTMiddleware, (req, res) => {
  res.json({ success: true });
});

// Payments
app.post('/api/payments/create-order', JWTMiddleware, (req, res) => {
  res.json({
    id: 'pay_order_' + Date.now(),
    amount: req.body.amount,
    currency: req.body.currency || 'INR',
    status: 'created'
  });
});

app.post('/api/payments/verify', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => b.id === req.body.bookingId || b.bookingId === req.body.bookingId);
  if (booking) {
    booking.paymentStatus = 'PAID';
  }
  res.json({ success: true, message: 'Payment verified successfully' });
});

app.get('/api/payments/history', JWTMiddleware, (req, res) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;
  
  let userBookings = [];
  if (userRole === 'customer') {
    userBookings = bookingsDb.filter(b => String(b.customerId) === String(userId) || String(b.customer_id) === String(userId));
  } else if (userRole === 'provider') {
    userBookings = bookingsDb.filter(b => String(b.providerId) === String(userId) || String(b.provider_id) === String(userId));
  } else {
    userBookings = bookingsDb;
  }
  
  // Map each booking to a payment history record
  const paymentHistory = userBookings.map((b) => {
    let status = b.paymentStatus || b.payment_status || 'Pending';
    if (b.status && ['completed', 'COMPLETED', 'Completed'].includes(b.status)) {
      status = 'Paid';
    }
    
    // Normalize status casing to match UI design (Paid, Pending, Refunded, Failed)
    if (String(status).toLowerCase() === 'paid') status = 'Paid';
    else if (String(status).toLowerCase() === 'pending') status = 'Pending';
    else if (String(status).toLowerCase() === 'refunded') status = 'Refunded';
    else if (String(status).toLowerCase() === 'failed') status = 'Failed';

    return {
      id: 'pay_' + b.id,
      paymentId: 'pay_' + b.id,
      bookingId: b.bookingId || b.id,
      providerId: b.providerId || '',
      providerName: b.providerName || b.provider_name || 'Service Provider',
      customerId: b.customerId || b.customer_id || '',
      customerName: b.customerName || b.customer_name || 'Customer',
      amount: b.totalPrice || b.estimated_price || 0,
      paymentStatus: status,
      paymentMethod: b.paymentMethod || 'Credit Card',
      transactionId: 'TXN-' + String(b.id || '').toUpperCase().replace('BK_', '').replace('BKG-', ''),
      paymentDate: b.updated_at || b.created_at || new Date().toISOString(),
      invoiceId: 'INV-' + b.id
    };
  });
  
  res.json(paymentHistory);
});

app.get('/api/payments/:id', JWTMiddleware, (req, res) => {
  res.json({ id: req.params.id, status: 'PAID', amount: 500 });
});

app.get('/api/payments/status/:bookingId', JWTMiddleware, (req, res) => {
  const booking = bookingsDb.find(b => b.id === req.params.bookingId || b.bookingId === req.params.bookingId);
  res.json({ status: booking?.paymentStatus || 'PENDING' });
});

app.post('/api/payments/refund/request', JWTMiddleware, (req, res) => {
  res.json({ success: true, message: 'Refund requested' });
});

app.get('/api/invoices/:paymentId', JWTMiddleware, (req, res) => {
  res.json({ invoiceId: 'INV-' + req.params.paymentId });
});

app.get('/api/invoices/download/:paymentId', (req, res) => {
  const paymentId = req.params.paymentId;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${paymentId}.txt`);
  res.send(`===================================================
                  SERVICEHUB SERVICE INVOICE
===================================================
Invoice ID:      INV-${paymentId}
Date:            ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Transaction ID:  TXN-${String(paymentId).toUpperCase()}
Payment Method:  Credit Card / Online
Payment Status:  PAID
===================================================
Service Details:
---------------------------------------------------
Platform Convenience and Provider Service Charges.
Total Amount:    USD/INR Equivalent
===================================================
Thank you for booking with ServiceHub App!
If you have any questions, contact support@servicehubapp.com
===================================================`);
});

// ML APIs
app.post('/api/ml/recommendations', (req, res) => {
  res.json(providersDb.slice(0, 3));
});

app.post('/api/ml/price-prediction', (req, res) => {
  res.json({ predictedPrice: (req.body.basePrice || 300) * 1.1 });
});

app.post('/api/ml/fraud-check', (req, res) => {
  res.json({ isFraud: false, score: 0.05 });
});

app.post('/api/ml/customer-analysis', (req, res) => {
  res.json({ score: 95, segments: ['loyal', 'high-spender'] });
});

app.post('/api/ml/provider-ranking', (req, res) => {
  res.json({ rank: 1, percentile: 99 });
});

// Admin APIs
app.get('/api/admin/dashboard', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({
    totalUsers: 15,
    totalProviders: providersDb.length,
    totalBookings: bookingsDb.length,
    totalRevenue: bookingsDb.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  });
});

app.get('/api/admin/users', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json([]);
});

app.put('/api/admin/users/:id/toggle-status', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.put('/api/admin/providers/:id/approve', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.put('/api/admin/providers/:id/reject', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.post('/api/admin/categories', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.put('/api/admin/categories/:id', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.delete('/api/admin/categories/:id', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.get('/api/admin/payments', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json([]);
});

app.get('/api/admin/revenue', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ revenue: 10000 });
});

app.post('/api/admin/notifications/send', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.post('/api/admin/notifications/broadcast', JWTMiddleware, RoleMiddleware(['admin']), (req, res) => {
  res.json({ success: true });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
