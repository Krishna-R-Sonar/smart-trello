#  Smart Trello – Ekosight Assignment

A modern Trello-style task management board with real-time collaboration, smart recommendations, drag-and-drop lists/cards, and team invitations — built with the **MERN Stack + Socket.io**.

---

## 🚀 How to Run the Project (Local Development)

### **Prerequisites**

* Node.js **v18+**
* MongoDB Atlas account **OR** local MongoDB server
* Git

---

##  Project Setup

### **1. Backend Setup**

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb+srv://your-user:your-pass@cluster.mongodb.net/smart-trello
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
# development mode
npm run dev

# production mode
npm start
```

---

### **2. Frontend Setup**

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

### **3. Access the App**

* Frontend → **[http://localhost:5173](http://localhost:5173)**
* Backend → **[http://localhost:5000](http://localhost:5000)**
* Health Check → **[http://localhost:5000/health](http://localhost:5000/health)**

---

#  Architecture Explanation

This project follows a **full MERN architecture**, split into two major parts:
**Backend (API + Real-time)** and **Frontend (UI + Client Logic)**.

---

##  **1. Backend Architecture (Node.js + Express + MongoDB + Socket.io)**

### **API Layer (REST + JSON)**

The backend exposes RESTful endpoints for:

* Authentication (JWT + Cookies)
* Boards (CRUD)
* Lists (embedded in boards)
* Cards (CRUD, update, drag & drop support)
* Invitations
* Smart recommendations

### **Authentication**

* Users log in and receive a **JWT stored in an HTTP-only cookie**.
* Every protected route uses `authMiddleware` to verify the token and load the user.

### **Database Layer (MongoDB + Mongoose)**

* Users, Boards, and Cards stored as Mongoose models.
* Lists are embedded inside boards for **faster board fetch**.

### **Real-Time Layer (Socket.io)**

* Each board is treated as a **room**.
* When a board is updated (card moved, card added, list added, invite accepted),
  backend emits:

  ```
  io.to(boardId).emit("board:updated")
  ```
* All connected clients auto-refresh the board in real-time.

### **Smart Recommendation Engine**

A lightweight rule-based AI system:

* Suggests due dates based on keywords → “today”, “tomorrow”, “urgent”, etc.
* Suggests list movements → “completed”, “review”, “start working”
* Detects related cards using **keyword intersection**
* Returns a maximum of 8 recommendations for the board

---

##  **2. Frontend Architecture (React + Vite + Tailwind)**

### **Key Layers**

* **Pages** → BoardPage, Dashboard, Login, Register
* **Components** → List, Card, InviteModal, RecommendationsPanel
* **Context** → AuthContext for managing authentication state globally
* **Services** → Axios wrapper with `withCredentials`
* **Real-time** → Socket.io client connects and listens for updates

### **Drag & Drop**

Uses `@dnd-kit`:

* Each list has a SortableContext
* Each card uses useSortable
* Drag end returns:

  ```
  { active.cardId, active.listId, over.listId }
  ```

---

#  Database Schema Explanation

Your database uses **Mongoose models** with the following relationships:

---

##  **User Model**

```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  boards: [ObjectId], // Boards the user is a member of
  timestamps: true
}
```

### Purpose:

* Stores user information
* Tracks owned and joined boards
* Used for authentication

---

##  **Board Model**

```
{
  title: String,
  owner: ObjectId (ref: User),
  members: [ObjectId (ref: User)],
  lists: [ListSchema],      // Embedded schema
  invites: [String],        // Pending email invitations
  timestamps: true
}
```

### Why Lists Are Embedded?

* A board always loads its lists together → embedding is faster.
* Lists rarely need to be queried independently → no need for separate collection.

---

##  **List Schema (Embedded inside Board)**

```
{
  title: String,
  order: Number, 
  cards: [ObjectId] // references cards stored separately
}
```

### Purpose:

Represents vertical columns like:
**To Do | In Progress | Done**

### Why cards are NOT embedded?

* Cards can grow very large in number.
* Cards often updated individually → better to store as separate documents.

---

##  **Card Model**

```
{
  title: String,
  description: String,
  listId: ObjectId,
  boardId: ObjectId,
  dueDate: Date,
  labels: [String],
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Purpose:

Represents a task.
Stored separate from boards for:

* Scalability
* Faster updates
* Independent operations (move, update, etc.)

---

##  Relationships Summary

| Entity        | Relationship           |
| ------------- | ---------------------- |
| User → Boards | 1:N                    |
| Board → Lists | 1:N (embedded)         |
| List → Cards  | 1:N (referenced)       |
| Board ↔ Users | Many-to-Many (members) |
| Card → User   | 1:1 creator            |

---

##  Why This Schema Works Well?

* **Fast board load** → lists embedded
* **Fast card operations** → cards are separate
* **Good for real-time** → minimal DB calls when updating
* **Scalable** → cards don't bloat board documents
* **Clean structure** → simple to maintain
