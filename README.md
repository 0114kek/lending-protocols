# Lending Protocols Dashboard

A modern, high-performance DefiLlama dashboard comparing Total Value Locked (TVL), Daily Fees, and Daily Revenue across the top lending markets: Aave V3, Morpho, Euler V2, and Fluid Lending.

## Features

- **Automated Data Sync**: An integrated Express server routinely pulls historical data from DefiLlama into an extremely fast SQLite cache to bypass rate-limiting and accelerate dashboard load times.
- **Glassmorphism UI**: A gorgeous, unified vanilla CSS style system with premium translucent tables, crisp modern fonts, and subtle animations. 
- **Deep Comparisons & Period Filters**: Render your comparisons dynamically over 1W, 1M, 6M, 1Y, or ALL timeframes using dedicated pill toggle buttons to inspect trends cleanly.
- **Performance Summaries**: Quickly compare any protocol's absolute market share and growth rate using the side-by-side data tables for 7D, 30D, and Annualized performance. 

## Requirements

- Node.js >= 18

## Running Locally

To spin up the comprehensive full-stack ecosystem locally, install dependencies and start the dev service process:

```bash
npm install
npm run dev
```

The system will start both the local React development front-end application via Vite and the background Express API instance. Data will automatically begin buffering locally immediately.

## Data Privacy & Financial Disclaimer

Information provided out of this system leverages general analytics provided publicly by DefiLlama. The statistics displayed constitute generalized information algorithms only—they do not amount to guaranteed financial advice or asset reliability. The creators assume NO liability for individual trading/DeFi decisions inspired by this platform. 

***This sophisticated dashboard and environment was generated seamlessly by Google Deepmind Gemini.***
