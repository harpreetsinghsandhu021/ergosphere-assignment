# Scribe: Your Conversational Second Brain

**Ergosphere Solutions Technical Assessment**  
_Submitted by: Harpreet Singh_

"Scribe" is a full-stack, AI-powered chat application designed to be a "conversational second brain." It allows users to have real-time, streaming conversations with an AI (powered by Google's Gemini 2.5 Flash), securely stores all conversation history, and provides powerful "Conversation Intelligence" features, including on-demand AI analysis and hybrid semantic search.

This project was built using a modern stack: React with Zustand and Tailwind CSS on the frontend, and Django with Django REST Framework on the backend.

---

## 1. Features & Screenshots

This submission implements **100% of the core features** requested, plus several bonus features for a more complete and polished user experience.

### Core Features Implemented

- [x] **Real-time Chat**: Interactive, streaming responses from the Gemini 2.5 Flash model
- [x] **Conversation Management**: Full CRUD capabilities for conversations and messages, with a clean sidebar for navigation and creation of new chats
- [x] **Conversation Intelligence**: On-demand "Analyze Conversation" button that generates and saves an AI summary, key points, and a vector embedding
- [x] **Semantic Search**: Powerful hybrid search combining high-quality vector similarity search with robust keyword search fallback
- [x] **AI Analysis**: Automatic summary and key point extraction, available on demand
- [x] **Clean UI**: Modern, responsive, dual-theme chat interface built with Tailwind CSS

### Bonus Features Implemented

- [x] **Dark Mode Toggle**: Fully functional dark mode for user comfort
- [x] **Conversation Sharing**: Generate shareable public links for conversations

### Screenshots

#### Light Mode - Main Interface

![Light Mode - Main Interface](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.26.47.png)

#### Dark Mode - Main Interface

![Dark Mode - Main Interface](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.27.55.png)

#### Real-time Streaming & Markdown

![Real-time Streaming & Markdown](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.27.04.png)

#### On-Demand Analysis

![On-Demand Analysis](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.27.16.png)

#### Hybrid Semantic Search

![Hybrid Semantic Search](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.27.31.png)

![Hybrid Semantic Search](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.27.39.png)

#### Conversation Sharing

![Conversation Sharing](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.28.07.png)

![Conversation Sharing](./frontend/src/assets/Screenshot%202025-11-09%20at%2020.28.31.png)

---

## 2. Architecture Diagram

The architecture is a clean, decoupled full-stack application. The frontend (React/Zustand) manages all UI state, while the backend (Django/DRF) serves as a robust, stateless API that handles business logic and AI orchestration.

```
+---------------------------+       +-------------------------+       +-------------------+
|                           |       |                         |       |                   |
|   React (Next.js) Frontend|       |  Django (DRF) API       |       |   Gemini 2.5 Flash|
|   (with Zustand Store)    | <---> |  (Business Logic,       | <---> |   (Chat, Embeddings)|
|                           |       |   Search, Analysis)     |       |                   |
+---------------------------+       +-------------------------+       +-------------------+
                                            |
                                            | (Stores/Retrieves)
                                            v
                                  +---------------------+
                                  |                     |
                                  |  PostgreSQL Database|
                                  |  (Conversations,    |
                                  |   Messages, Vectors)|
                                  +---------------------+
```

---

## 3. Setup & Running the Application

### Prerequisites

- Python 3.10+ and pip
- Node.js 18+ and npm (or yarn)
- A valid `GOOGLE_API_KEY` from [Google AI Studio](https://aistudio.google.com/)
- A running PostgreSQL server

### A. Backend (Django / DRF)

1. **Navigate to the backend directory:**

   ```bash
   cd backend/chat_api
   ```

2. **Create a virtual environment (Recommended):**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**  
   In the `backend/chat_api` directory, create a file named `.env` and add your API key:

   ```
   GOOGLE_API_KEY=YOUR_API_KEY_GOES_HERE
   ```

   _Note: You will also need to configure your PostgreSQL connection in `settings.py`_

5. **Run database migrations:**

   ```bash
   python manage.py migrate
   ```

   _(This will create the tables AND seed the database with sample conversations via the data migration.)_

6. **Run the server:**

   ```bash
   python manage.py runserver
   ```

   The backend will be running at `http://127.0.0.1:8000`.

### B. Frontend (React / Next.js)

1. **Open a new terminal and navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm start
   ```

   The frontend will open at `http://localhost:5173` (or your configured React port).

---

## 4. API Documentation (OpenAPI)

The API is fully documented using the **OpenAPI 3.0** standard with `drf-spectacular`, as requested.

Once the backend server is running, the interactive **Swagger UI** can be accessed at:

**http://127.0.0.1:8000/api/schema/swagger-ui/**

This UI provides a complete, interactive list of all endpoints, their required parameters, and their expected responses.

---

## 5. Architecture & Scalability Notes

This section outlines key architectural decisions and "next steps" for a production environment.

### A. "Hybrid Search" Implementation

The semantic search is a key feature. To ensure all data is searchable (not just "analyzed" data), I implemented a **Hybrid Search** model:

- **Vector Search**: For conversations with an embedding, a high-quality numpy-based cosine similarity search is performed
- **Keyword Search**: For all other conversations, a fallback `icontains` keyword search is run against the raw message content
- **Merged Results**: The results are merged, prioritizing the "smart" vector search hits first

### B. Production Scalability (Vector Search)

The current vector search performs a sequential scan over the embeddings, which is not scalable. For a production system, the clear next step would be to:

1. Install the `pgvector` extension in PostgreSQL
2. Add a specialized HNSW or IVF vector index to the `vector_embedding` column
3. Refactor the `SemanticSearchView` to use a pgvector similarity query (e.g., `ORDER BY vector <-> query_vector LIMIT 10`), which would provide sub-second, approximate-nearest-neighbor (ANN) search across millions of conversations

### C. Future Enhancement (RAG)

The current search retrieves relevant conversations. A future enhancement (as suggested in the Example User Flow) would be to implement a full **Retrieval-Augmented Generation (RAG)** pattern. This would involve:

1. Using the search results as a "context"
2. Feeding that context, along with the user's query, into a second call to the Gemini model
3. Streaming the AI's synthesized answer (e.g., "You discussed planning a trip to Japan...") directly to the user

These architectural "next steps" were omitted in the current implementation to focus on delivering a solid, working foundation within the assessment timeframe.

---

## Tech Stack

**Frontend:**

- React (Next.js)
- Zustand (State Management)
- Tailwind CSS

**Backend:**

- Django
- Django REST Framework
- drf-spectacular (OpenAPI)

**AI:**

- Google Gemini 2.5 Flash

**Database:**

- PostgreSQL
