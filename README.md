# 💎 Polychrome | Polyhedral Loop Optimizer

![Polychrome Banner](./demo.png)

**Polychrome** is an interactive, web-based tool designed for visualizing and optimizing nested loop iteration spaces using the **Polyhedral Model**. Built for the **Compiler Design Hackathon 2026**, it provides a stunning 3D interface to explore loop transformations, iteration domains, and dependency highlighting.

---

## ✨ Features

- **🚀 Real-time 3D Visualization**: Explore complex iteration domains (including 3D Diamond/Octahedron shapes) using Three.js and React-Three-Fiber.
- **🛠️ Interactive Source Editor**: Edit loop bounds and patterns directly. Supports rectangular and non-rectangular (polyhedral) domains.
- **🔄 Polyhedral Transformations**:
  - **Identity**: Standard loop execution.
  - **Loop Skewing**: Transform loops for parallelism.
  - **Interchange (I, J)**: Swap loop orders to improve cache locality.
  - **Matrix Mult Optimization**: specialized (I, K, J) order for high-performance matrix multiplication.
- **🔦 Node Highlighting**: Input specific $(i, j, k)$ coordinates to see them glow in the 3D space with real-time lighting effects.
- **📐 Mathematical Insights**: Live LaTeX rendering of Iteration Domain inequalities ($\mathcal{D}$) and Transformation Matrices ($T$).
- **💻 Optimized Code Generation**: See the resulting optimized C code for any transformation in real-time.

---

## 🛠️ Tech Stack

- **Core**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Graphics**: [Three.js](https://threejs.org/) + [React-Three-Fiber](https://docs.pmnd.rs/react-three-fiber) + [Drei](https://github.com/pmndrs/drei)
- **Math**: [KaTeX](https://katex.org/) for mathematical notation.
- **Styling**: Vanilla CSS with modern glassmorphism and neon aesthetics.
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/polychrome.git
   cd polychrome
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Architecture

This project is modularly structured to separate mathematical logic from visual representation and UI management. Below is a guide to the core components:

### 🧠 Core Logic
- **[`polyhedralEngine.js`](file:///c:/Users/HP/OneDrive/Desktop/CompDeg_hack/src/polyhedralEngine.js)**: The mathematical heart of the application.
  - Defines transformation matrices ($T$) for Skewing, Interchange, etc.
  - Generates iteration points for different domain types (Rectangular vs. Diamond).
  - Handles the mapping of original points $\vec{x}$ to transformed points $\vec{x}'$.
  - Generates optimized C code snippets based on the active transformation.

### 🎨 Visuals & UI
- **[`App.jsx`](file:///c:/Users/HP/OneDrive/Desktop/CompDeg_hack/src/App.jsx)**: The main entry point for the UI.
  - Manages application state (loop bounds, selected transformation, highlighted nodes).
  - Implements the sidebar controls and the real-time code editor.
  - Coordinates communication between the UI and the 3D visualization.
- **[`IterationSpace.jsx`](file:///c:/Users/HP/OneDrive/Desktop/CompDeg_hack/src/IterationSpace.jsx)**: The 3D Rendering Engine.
  - Built with `react-three-fiber` and `Three.js`.
  - Renders the iteration points as 3D spheres (nodes) and connects them with lines to show the flow.
  - Implements smooth animations when the transformation matrix changes.
  - Handles real-time lighting and camera controls.

### ⚙️ Infrastructure
- **[`main.jsx`](file:///c:/Users/HP/OneDrive/Desktop/CompDeg_hack/src/main.jsx)**: Standard React entry point that bootstraps the app.
- **[`index.css`](file:///c:/Users/HP/OneDrive/Desktop/CompDeg_hack/src/index.css)**: Contains the "Neon-Glassmorphism" design system, defining the glow effects, glass panels, and typography.

---

## 📖 How it Works

The tool operates on the principle that any nested loop can be represented as a set of integer points within a polyhedron (the **Iteration Domain** $\mathcal{D}$).

1. **Domain Generation**: Based on the user's input (e.g., $N=5$), `polyhedralEngine.js` calculates all valid $(i, j, k)$ coordinates.
2. **Transformation**: When a transformation is selected, each point is multiplied by a matrix $T$:
   $$ \begin{bmatrix} i' \\ j' \\ k' \end{bmatrix} = \begin{bmatrix} T_{11} & T_{12} & T_{13} \\ T_{21} & T_{22} & T_{23} \\ T_{31} & T_{32} & T_{33} \end{bmatrix} \begin{bmatrix} i \\ j \\ k \end{bmatrix} $$
3. **Visualization**: `IterationSpace.jsx` takes these transformed coordinates and maps them to 3D space, animating the transition from the old space to the new one.
4. **Code Synthesis**: The engine reconstructs the loop bounds for the transformed space to produce optimized C code.

---

## 🏆 Hackathon Project
This project was developed as part of the **Compiler Design Hackathon 2026** to make complex loop optimization concepts accessible and visually intuitive.

**Developer**: Sidharth Nair, N S Balaji
**License**: MIT
