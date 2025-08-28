# KCS - Knowledge Container System

This repository contains the full-stack codebase for the KCS MVP. The project is structured as a monorepo with a `backend` (Flask API) and a `frontend` (React App).

## Project Setup

### Prerequisites

- [Python](https://www.python.org/downloads/) (3.8 or higher)
- [uv](https://github.com/astral-sh/uv), the fast Python package manager.
- [Node.js](https://nodejs.org/) and npm (v16 or higher)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and a database cluster.

#### Installing `uv`

If you don't have `uv` installed, you can do so with one of the following commands:

- **macOS / Linux:**
  ```shell
  curl -LsSf [https://astral.sh/uv/install.sh](https://astral.sh/uv/install.sh) | sh
  ```
- **Windows (PowerShell):**
  ```shell
  irm [https://astral.sh/uv/install.ps1](https://astral.sh/uv/install.ps1) | iex
  ```

---

### Backend Setup (with uv)

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment using `uv`:**

    ```bash
    # This creates a virtual environment in a .venv directory
    uv venv

    # Activate the environment
    # On macOS/Linux
    source .venv/bin/activate

    # On Windows
    .venv\Scripts\activate
    ```

3.  **Install Python dependencies using `uv`:**
    This command reads the `requirements.txt` file and installs the packages into your activated environment. It is significantly faster than using standard pip.

    ```bash
    uv pip install -r requirements.txt
    ```

4.  **Configure environment variables:**

    - Create a file named `.env` in the `backend` directory by copying the example:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and add your MongoDB connection details:
      ```
      MONGODB_URI=your_mongodb_atlas_connection_string
      DATABASE_NAME=your_database_name
      ```

5.  **Run the Backend API:**
    ```bash
    flask run
    ```
    The API will be running at `http://127.0.0.1:5000`.

---

### Frontend Setup

1.  **Navigate to the frontend directory (from the root):**

    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    - Create a file named `.env` in the `frontend` directory:
      ```bash
      cp .env.example .env
      ```
    - The default value `REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api` should work with the local backend. You don't need to change it for local development.

4.  **Run the Frontend Application:**
    ```bash
    npm start
    ```
    The React app will open in your browser at `http://localhost:3000`.
