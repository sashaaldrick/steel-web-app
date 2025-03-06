# Steel Optimization Web App

A web application that enables Solidity developers to optimize their smart contracts using Steel and zero-knowledge proofs.

## Features

- Fetch Solidity contracts from Etherscan using a provided address
- Highlight optimizable functions and let users select one to optimize
- Generate a zero-knowledge proof using Bonsai via a Rust backend
- Publish the proof on-chain with a single click
- Pre-loaded examples of the top 3 DeFi smart contracts for quick testing

## Tech Stack

- **Frontend**: Next.js, TailwindCSS, Bun
- **Code Display**: CodeMirror for Solidity display and highlighting
- **Blockchain Integration**: ThirdWeb SDK for wallet connection and transaction handling
- **External APIs**: Etherscan API for fetching contract source code

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/steel-web-app.git
   cd steel-web-app
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   NEXT_PUBLIC_ETHERSCAN_API_KEY=your-etherscan-api-key
   BONSAI_API_KEY=your-bonsai-api-key
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter an Etherscan contract address or select one of the pre-loaded examples.
2. The app will display the contract code and highlight optimizable functions.
3. Select a function to optimize and provide its parameters.
4. Click "Generate Proof" to create a zero-knowledge proof.
5. Connect your wallet and click "Publish Proof" to submit it on-chain.

## Development

### Project Structure

```
steel-web-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-proof/
│   │   │       └── route.ts
│   │   ├── contract/
│   │   │   └── [address]/
│   │   │       └── page.tsx
│   │   ├── proof/
│   │   │   └── [address]/
│   │   │       └── [function]/
│   │   │           └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── AppLayout.tsx
│       └── ThirdwebProvider.tsx
├── public/
├── .env.local
├── package.json
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Steel](https://github.com/steel-dev/steel) - Zero-knowledge proof library for Solidity
- [RISC Zero](https://www.risczero.com/) - Zero-knowledge virtual machine
- [Bonsai](https://www.risczero.com/bonsai) - Zero-knowledge proof service
- [ThirdWeb](https://thirdweb.com/) - Web3 development framework
- [Etherscan](https://etherscan.io/) - Ethereum blockchain explorer
