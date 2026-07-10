# 🖥️ UI Testing & Responsive Design Checklist

## Framework & Environment
* **Framework:** React 19, Vite, Tailwind CSS
* **Browsers Tested:** Chrome, Firefox, Safari, Edge
* **Viewports Tested:** Desktop (1920px), Laptop (1440px), Tablet (768px), Mobile (375px)

## 1. Global Navigation & Layout
- [x] Navbar collapses into a hamburger menu on Mobile (375px) and Tablet (768px).
- [x] Sidebar correctly toggles and uses an overlay on smaller screens.
- [x] Footer remains at the bottom of the page even on short content pages.
- [x] Dark Mode toggle smoothly transitions all CSS variables (if applicable).

## 2. Authentication Flows (Login / Register)
- [x] Forms are centered vertically and horizontally on Desktop.
- [x] Forms take up 100% width with appropriate padding on Mobile.
- [x] Input validation error messages appear in red beneath the respective fields.
- [x] Password visibility toggle eye-icon works correctly without submitting the form.

## 3. Customer Dashboard & Service Search
- [x] Service Cards display in a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- [x] Images within cards maintain aspect ratio (`object-cover`) without distortion.
- [x] Text truncation works for long service descriptions (`line-clamp-2`).
- [x] Search bar and filter dropdowns stack vertically on Mobile.

## 4. Provider Dashboard & Bookings
- [x] Booking Status Tables wrap or become horizontally scrollable on small screens to prevent breaking the layout.
- [x] Action buttons (Accept, Reject) are tap-friendly on Mobile (min 44px height).
- [x] Revenue Charts (Recharts) automatically resize based on the parent container width.

## 5. Booking Flow & Modals
- [x] Modals are centered and use a dark backdrop overlay.
- [x] Clicking outside the modal or pressing `ESC` closes it.
- [x] Date and Time picker inputs render correctly natively on iOS/Android.

## 6. Payment Interface
- [x] Razorpay modal opens correctly on top of the UI.
- [x] Loading spinners are displayed while awaiting order creation.
- [x] Success/Failure toast notifications slide in from the top right.

## Conclusion
The UI built with Tailwind CSS effectively handles breakpoints and ensures a seamless experience across devices. No layout-breaking bugs were identified during the responsive checks.
