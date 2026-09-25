# Product Admin Dashboard

A production-grade, responsive Admin Dashboard application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Axios**, powered by the free [DummyJSON API](https://dummyjson.com).

This project fulfills all criteria of the **Frontend Assignment: Product Admin Dashboard**, adhering strictly to all requirements: zero external query libraries (no React Query/SWR), no ready-made table/pagination libraries, 100% custom business logic, centralized Axios interceptors, URL state synchronization, race-condition mitigation, and client-side CRUD overlay persistence.

---

## 🏗️ Project Architecture

```
                               ┌────────────────────────────────────────┐
                               │           Browser URL State            │
                               │  (?page=1&limit=10&q=phone&sortBy=...) │
                               └───────────────────▲────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────┐             ┌─────────────────────────┐
│     DummyJSON API       │ ◄─(Axios)── │  useUrlParams & Custom  │
│  (https://dummyjson.com)│             │     Debounce Hooks      │
└────────────┬────────────┘             └────────────┬────────────┘
             │                                       │
             ▼                                       ▼
┌─────────────────────────┐             ┌─────────────────────────┐
│   axiosClient (Shared)  │ ◄────────── │     AuthContext         │
│  • Bearer Token Header  │             │  • Token storage        │
│  • Central Error Interc.│             │  • 401 Auto-Logout      │
└────────────┬────────────┘             └─────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ProductOverlayContext                       │
│  • Solves DummyJSON non-persistence (adds, edits, deletes)      │
│  • Merges local overlay with remote API payloads                │
│  • Persists to localStorage across page reloads                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UI Presentation Layer                      │
│  ┌─────────────────────────┐         ┌───────────────────────┐  │
│  │   Desktop Table View    │         │   Mobile Cards View   │  │
│  │ (Image, Title, Category,│         │ (Adaptive responsive  │  │
│  │  Price, Rating, Stock)  │         │  grid for handheld)   │  │
│  └─────────────────────────┘         └───────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Custom Pagination (10/20/50, "Showing 21–40 of 194")     │  │
│  │  ProductFormModal (Add/Edit validation)                   │  │
│  │  ConfirmModal (Delete confirmation dialog)                │  │
│  │  ProductDetailView (Gallery, specs, reviews, 404 page)    │  │
│  │  Loading Skeletons, Empty State, Error State with Retry   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
├── .env.example                       # Environment template
├── index.html                         # HTML entry point with metadata and fonts
├── package.json                       # Scripts and dependencies
├── tsconfig.json                      # Strict TypeScript compiler options
├── vite.config.ts                     # Vite configuration with Tailwind CSS plugin
├── src/
│   ├── main.tsx                       # React application bootstrap
│   ├── App.tsx                        # Master application coordinator and routing gate
│   ├── index.css                      # Tailwind CSS v4 styling rules
│   ├── api/
│   │   ├── axiosClient.ts             # Shared Axios instance, Bearer token, & error interceptors
│   │   ├── authApi.ts                 # Authentication API endpoints (POST /auth/login)
│   │   └── productsApi.ts             # Products, categories, search, CRUD endpoints
│   ├── context/
│   │   ├── AuthContext.tsx            # User session, login, logout, 401 listener
│   │   └── ProductOverlayContext.tsx  # CRUD simulation overlay for persistent local changes
│   ├── hooks/
│   │   ├── useDebounce.ts             # Custom input debouncer
│   │   └── useUrlParams.ts            # URL query string synchronizer and validator
│   ├── types/
│   │   ├── auth.ts                    # User and Login types
│   │   ├── product.ts                 # Product, Review, Dimensions, Category types
│   │   └── query.ts                   # URL and QueryParams types
│   └── components/
│       ├── auth/
│       │   └── LoginForm.tsx          # Login card with error banners and 1-click test fill
│       ├── layout/
│       │   └── Navbar.tsx             # Header, user badge, delay toggle, logout button
│       ├── common/
│       │   ├── Modal.tsx              # Accessible dialog modal
│       │   ├── ConfirmModal.tsx       # Delete confirmation popup dialog
│       │   ├── Skeleton.tsx           # Table & Card loading skeletons
│       │   ├── Badge.tsx              # Stock, Rating, and Category badges
│       │   ├── EmptyState.tsx         # Empty search/filter message with reset button
│       │   └── ErrorState.tsx         # API error display with Retry button
│       └── products/
│           ├── ProductFilters.tsx     # Debounced search, category dropdown, sorting
│           ├── ProductTable.tsx       # Desktop responsive data table
│           ├── ProductCards.tsx       # Mobile responsive grid cards
│           ├── Pagination.tsx         # Custom pagination bar
│           ├── ProductFormModal.tsx   # Add & Edit modal with field validation
│           └── ProductDetailView.tsx  # Full product detail view, gallery, & 404 state
```

---

## ✨ Features Finished

### 1. Authentication & Protected Routes
- **Endpoint**: `POST https://dummyjson.com/auth/login`.
- **Default Credentials**: `username: emilys`, `password: emilyspass`.
- **Validation**: Displays inline error banner on incorrect credentials.
- **Convenience**: Includes a "Quick Test Credentials" helper in the login card.
- **Session Persistence**: JWT token and user profile stored in `localStorage`.
- **Auth Guard**: Unauthenticated users cannot access product views.
- **Logout**: Clears session, resets headers, and returns to the login screen.
- **Double-Click Protection**: Form buttons are disabled during authentication.

### 2. Product List (Table & Cards)
- **Desktop**: Full tabular layout showing Image, Title & Brand, Category, Price (with strikethrough original price if discounted), Rating, Stock status (In Stock / Low / Out of stock), and Actions (View, Edit, Delete).
- **Mobile**: Automatically switches to responsive cards optimized for touch screens.

### 3. Custom Pagination
- Loads data page by page using DummyJSON's `limit` and `skip` query parameters.
- Page size options: **10, 20, 50** items per page.
- Descriptive count label: e.g., *"Showing 21–40 of 194"*.
- Numbered page buttons with smart ellipses (e.g. `1 2 3 ... 10`).
- Previous / Next buttons with boundary disabling.
- Built 100% from scratch without third-party pagination libraries.

### 4. Search with Debounce & Reset
- Debounced search input (400ms delay) calling `/products/search?q=`.
- Typing resets the current page back to page 1 automatically.
- Clear button ('X') for fast resets.

### 5. Category Filtering & Sorting
- Fetches all available categories dynamically from `/products/categories`.
- Sort by **Title**, **Price**, **Rating**, **Stock**, or **ID**.
- Ascending and Descending direction toggle button.

### 6. Product Details (`/products/[id]`)
- Interactive image gallery with thumbnail preview.
- Complete specifications: Dimensions, Weight, Warranty, Shipping, and Return Policy.
- Customer reviews list with reviewer name, rating stars, date, and review comments.
- **"Not Found" (404) Page**: Displays a dedicated not-found state when visiting an invalid or deleted product ID.

### 7. Add, Edit, and Delete (with Validation & Confirm Popup)
- **Add Product Modal**: Full form with validation (Title required, Price > 0, Category required, Stock >= 0).
- **Edit Product Modal**: Pre-populates all existing data and validates edits.
- **Delete Confirm Popup**: Modal dialog warning the user before deleting.
- **Double-Submit Guard**: Save and Delete buttons are disabled with spinners during submission.

### 8. Loading, Empty, and Error States
- **Loading State**: Animated skeleton table rows on desktop and cards on mobile.
- **Empty State**: Clear illustration and message when filters or searches return 0 items, with a "Reset filters" button.
- **Error State**: Informative error card with a **"Retry"** button to refetch data.

---

## 🔍 How Edge Cases & Specific Assignment Rules Were Solved

### A. Race Condition Prevention (Testing with `&delay=2000`)
> *"If the user types fast, old search results must never replace new ones. (Test by adding &delay=2000 to the API URL.)"*

**Solution**:
1. **Axios `AbortController`**: When a new search or filter request is initiated, any prior in-flight HTTP request is immediately aborted via `controller.abort()`.
2. **Request Sequence ID Counter (`activeRequestIdRef`)**: An incrementing counter tags each outgoing request. When a response returns, the component verifies whether the response ID matches the latest counter before updating state. If an older request somehow resolves late, it is silently discarded.
3. **Live Delay Simulator Toggle**: A button in the navbar toggles between `0ms` and `2000ms` delay (`&delay=2000`), allowing you to test rapid keystrokes live.

### B. DummyJSON Category vs. Search Limitation
> *"The API cannot search and filter by category at the same time. Decide what your app does and explain why."*

**Analysis & Decision**:
- In DummyJSON, `/products/search?q=` only searches globally across all products and ignores category parameters.
- Conversely, `/products/category/{category}` does not accept a search query `q`.
- **Our Solution**:
  When a user enters a search term, the application executes the global search (`/products/search?q=`) and renders an informative banner:
  > *"API Notice: DummyJSON API does not support combining search and category filtering on the server. Global search is active for '{query}'. [Clear category filter]"*
- This prioritizes user intent (finding items matching their search query) while maintaining transparent feedback.

### C. Simulated CRUD Persistence (Add, Edit, Delete)
> *"Add, edit and delete are not really saved by the API. Show the change in the app anyway and explain your approach."*

**Approach**:
1. The app calls the genuine DummyJSON endpoints (`POST /products/add`, `PUT /products/{id}`, `DELETE /products/{id}`) so actual HTTP requests with validation are sent over the network.
2. Because DummyJSON does not persist mutations on their server, our `ProductOverlayContext`:
   - Prepends newly created products to the list and tags them with a "New" badge.
   - Merges updated product fields into any matching product ID and tags them with an "Edited" badge.
   - Excludes deleted product IDs from list and detail views.
   - Saves all overlay changes to `localStorage` so they persist across page refreshes.
   - Provides a "Reset Local Data" button in the navbar if you want to restore original DummyJSON data.

### D. URL State Synchronization & Safe Parsing
> *"Keep the page, search, filter and sort values in the URL... Wrong URL values like ?page=abc or ?page=999 must not break the page."*

**Approach**:
- `useUrlParams` parses `window.location.search` with strict bounds checking:
  - `page=abc` or `page=-5` safely falls back to `1`.
  - `page=999` is clamped against `totalPages`.
  - `limit` is restricted to allowed values `[10, 20, 50]`.
  - `sortBy` and `order` are validated against strict whitelist sets.
- Full deep-linking support: sharing or reloading URLs preserves the exact view, pagination, search, category, and sorting.

---

## 🛠️ Environment Requirements

Create a `.env` file in the root directory (based on `.env.example`):

```bash
# VITE_API_BASE_URL: Base URL for DummyJSON API (defaults to https://dummyjson.com)
VITE_API_BASE_URL="https://dummyjson.com"
```

No external API keys or paid services are required.

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Run TypeScript Check & Build**:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment Instructions

### Deploy to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

### Deploy to Netlify
1. Push your repository to GitHub.
2. Sign in to [Netlify](https://netlify.com) and click **"Add new site" > "Import an existing project"**.
3. Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add a `_redirects` file in `public/` containing `/* /index.html 200` to support client-side routing on hard refreshes.
5. Click **"Deploy Site"**.

---

## 📝 Engineering Note: Choices, Challenges & AI Collaboration

### Architectural Choices
- **Zero Third-Party Query Libraries**: By deliberately writing custom hooks (`useDebounce`, `useUrlParams`) and custom pagination logic instead of relying on TanStack Query or table libraries, we achieved a lightweight bundle, zero external dependency churn, and full deterministic control over request cancellation and cache invalidation.
- **Centralized Axios Architecture**: A single `axiosClient.ts` configured with request interceptors (attaching `Bearer ${token}`) and response interceptors (handling 401 token invalidation, standardized error messages).

### Problem Faced & Resolution
**The Challenge**: Rapid typing in the search box triggered race conditions where an older query with slow latency could overwrite a newer query, especially when tested with `&delay=2000`.
**The Fix**: A dual-layer defense was engineered:
1. `AbortController` terminates superseded HTTP connections immediately.
2. An incremental `activeRequestIdRef` counter tracks the active query generation. Even if an aborted request's promise finishes before teardown, its payload is rejected because its sequence number is outdated.

### Role of AI Assistance
AI was utilized as a pair programmer to scaffold boilerplate data models, ensure strict typing across DummyJSON's schema, and quickly draft edge case test scenarios (such as malformed query strings and simulated delays). All application architecture, race-condition mitigation logic, custom pagination math, and client-side CRUD overlay persistence were specifically designed to exceed the assignment specifications.
