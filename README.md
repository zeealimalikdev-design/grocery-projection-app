# 🍐 Grocereal - Advanced Grocery Distribution Projector

![Gemini Glow](https://img.shields.io/badge/Branding-Gemini_Glow-purple?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vite_%7C_Dexie_%7C_Chart.js-green?style=for-the-badge)

A premium "FinTech" aesthetic web application designed for grocery distributors to track inventory, project income over a 12-month period, and analyze operational risks like spoilage and wastage.

---

## ✨ Features

### 📊 Financial Dashboard
- **Real-time Metrics**: Track Initial Revenue, Operating Expenses, Net Profit, and Break-even points.
- **Dynamic Charting**: A multi-series visualization comparing Revenue, Spoilage Loss, and Expenses with a Net Profit trend line.
- **Ideal vs. Realistic Toggle**: Switch between "Perfect Operations" and "Realistic Settings" to see hidden profit potential.

### 🧮 Advanced Projection Engine
- **Industry Metrics**: Includes Spoilage Rates, Bulk Thresholds, and Discount Percentages.
- **Wastage Impact**: Automatically calculates the cost of lost goods based on specific category risk levels.
- **PKR Default & Multi-Currency**: Optimized for the Pakistani market with built-in conversion to USD, EUR, GBP, and AED.

### 📦 Inventory & Expense Management
- **Risk Level Badges**: Visual indicators (High/Medium/Low Risk) for inventory items based on their perishability.
- **Persistence**: Powered by **Dexie.js (IndexedDB)**—all your data stays private and local to your browser.
- **CSV Export**: One-click download of all data for external accounting and reporting.

---

## 🛠️ Tech Stack

- **Core**: JavaScript (ES6+), HTML5, Vanilla CSS
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Database**: [Dexie.js](https://dexie.org/) (Browser IndexedDB)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **Icons**: [Lucide-static](https://lucide.dev/)
- **Typography**: [Cairo Play](https://fonts.google.com/specimen/Cairo+Play) (Google Fonts)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Installation
```powershell
# Clone the repository (if you downloaded it, skip to cd)
git clone https://github.com/zeealimalikdev-design/grocery-projection-app.git

# Navigate to the project folder
cd grocery-projection-app

# Install dependencies
npm install
```

### 3. Running Locally
```powershell
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## ☁️ Deployment (Render.com)

This app is optimized for static hosting. To deploy:

1. Push your code to GitHub.
2. In **Render**, create a new **Static Site**.
3. Use the following configuration:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Deploy! Your browser-based database will initialize automatically for every visitor.

---

## 📂 Project Structure

```text
grocery-projection-app/
├── src/
│   ├── db.js       # IndexedDB Schema and Defaults
│   └── logic.js    # Financial Calculation Engine
├── index.html      # Main Layout & Sidebar
├── main.js         # UI Controller & Chart Integration
├── style.css       # FinTech Design System & Gemini Glow
└── vite.config.js  # Build Configuration
```

---

## 💎 Branding 
Powered by **AUD AI TECH LLC**. 
The footer features a custom animated "Gemini Glow" gradient to celebrate modern AI aesthetics.

---

© 2026 Powered by AUD AI TECH LLC
