interface Env {
    ANTHROPIC_API_KEY: string;
    // Add any environment variables here if needed
}

// HTML template for the frontend
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contract Uploader</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
        }
        .upload-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .upload-button {
            background: #0070f3;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            margin-right: 10px;
        }
        .upload-button:hover {
            background: #0051b3;
        }
        #status {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 4px;
            white-space: pre-wrap;
            font-family: monospace;
            max-height: 500px;
            overflow-y: auto;
        }
        .success {
            background: #e6f4ea;
            color: #137333;
        }
        .error {
            background: #fce8e6;
            color: #c5221f;
        }
        .input-section {
            margin-bottom: 1.5rem;
        }
        .tab-container {
            display: flex;
            margin-bottom: 1rem;
        }
        .tab {
            padding: 0.5rem 1rem;
            cursor: pointer;
            border: 1px solid #ddd;
            background: #f5f5f5;
        }
        .tab.active {
            background: white;
            border-bottom: none;
        }
        .tab-content {
            display: none;
            padding: 1rem;
            border: 1px solid #ddd;
        }
        .tab-content.active {
            display: block;
        }
        textarea {
            width: 100%;
            min-height: 200px;
            padding: 0.5rem;
            font-family: monospace;
            border: 1px solid #ddd;
            border-radius: 4px;
            resize: vertical;
        }
    </style>
</head>
<body>
    <div class="upload-container">
        <h1>Smart Contract Analyzer</h1>
        
        <div class="input-section">
            <div class="tab-container">
                <div class="tab active" id="fileTab">Upload File</div>
                <div class="tab" id="textTab">Paste Code</div>
            </div>
            
            <div class="tab-content active" id="fileContent">
                <input type="file" id="contractFile" accept=".sol" style="display: none;">
                <button class="upload-button" onclick="document.getElementById('contractFile').click()">
                    Select Contract File
                </button>
                <span id="selectedFileName"></span>
            </div>
            
            <div class="tab-content" id="textContent">
                <textarea id="contractText" placeholder="Paste your Solidity contract code here..."></textarea>
            </div>
        </div>
        
        <button class="upload-button" id="analyzeButton">Analyze Contract</button>
        <div id="status"></div>
    </div>

    <script>
        // Tab switching functionality
        document.getElementById('fileTab').addEventListener('click', () => switchTab('file'));
        document.getElementById('textTab').addEventListener('click', () => switchTab('text'));
        
        function switchTab(tabName) {
            // Update tab classes
            document.getElementById('fileTab').classList.toggle('active', tabName === 'file');
            document.getElementById('textTab').classList.toggle('active', tabName === 'text');
            
            // Update content visibility
            document.getElementById('fileContent').classList.toggle('active', tabName === 'file');
            document.getElementById('textContent').classList.toggle('active', tabName === 'text');
        }
        
        // Show selected filename
        document.getElementById('contractFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('selectedFileName').textContent = file.name;
            }
        });
        
        // Handle the analyze button click
        document.getElementById('analyzeButton').addEventListener('click', async () => {
            const status = document.getElementById('status');
            status.textContent = 'Analyzing contract...';
            status.className = '';
            
            // Determine which input method is active
            const isFileTabActive = document.getElementById('fileTab').classList.contains('active');
            let contractData;
            
            if (isFileTabActive) {
                const fileInput = document.getElementById('contractFile');
                const file = fileInput.files[0];
                
                if (!file) {
                    // If no file is selected, open the file dialog
                    fileInput.click();
                    return;
                }
                
                contractData = await file.text();
            } else {
                contractData = document.getElementById('contractText').value.trim();
                
                if (!contractData) {
                    status.textContent = 'Please paste your contract code first.';
                    status.className = 'error';
                    return;
                }
            }
            
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: contractData
                });

                if (response.ok) {
                    const data = await response.json();
                    status.textContent = data.analysis;
                    status.className = 'success';
                } else {
                    throw new Error('Analysis failed');
                }
            } catch (error) {
                status.textContent = 'Error analyzing contract. Please try again.';
                status.className = 'error';
            }
        });
    </script>
</body>
</html>`;

interface ClaudeResponse {
    content: Array<{
        text: string;
    }>;
}

async function analyzeContractWithClaude(contractData: string, apiKey: string): Promise<string> {
    const prompt = `You are an expert in using RISC Zero for Steel execution proofs. 
    Please highlight the functions in the following contract that could be converted to using a ZK proof verification and give the suggested function.
    An example of a Steel ERC20 counter proof is as follows:

    pragma solidity ^0.8.20;

    import {IRiscZeroVerifier} from "risc0/IRiscZeroVerifier.sol";
    import {Steel} from "risc0/steel/Steel.sol";
    import {ICounter} from "./ICounter.sol";
    import {ImageID} from "./ImageID.sol"; // auto-generated contract after running \`cargo build\`.

    /// @title Counter
    /// @notice Implements a counter that increments based on off-chain Steel proofs submitted to this contract.
    /// @dev The contract interacts with ERC-20 tokens, using Steel proofs to verify that an account holds at least 1 token
    /// before incrementing the counter. This contract leverages RISC0-zkVM for generating and verifying these proofs.
    contract Counter is ICounter {
        /// @notice Image ID of the only zkVM binary to accept verification from.
        bytes32 public constant imageID = ImageID.BALANCE_OF_ID;

        /// @notice RISC Zero verifier contract address.
        IRiscZeroVerifier public immutable verifier;

        /// @notice Address of the ERC-20 token contract.
        address public immutable tokenContract;

        /// @notice Counter to track the number of successful verifications.
        uint256 public counter;

        /// @notice Journal that is committed to by the guest.
        struct Journal {
            Steel.Commitment commitment;
            address tokenContract;
        }

        /// @notice Initialize the contract, binding it to a specified RISC Zero verifier and ERC-20 token address.
        constructor(IRiscZeroVerifier _verifier, address _tokenAddress) {
            verifier = _verifier;
            tokenContract = _tokenAddress;
            counter = 0;
        }

        /// @inheritdoc ICounter
        function increment(bytes calldata journalData, bytes calldata seal) external {
            // Decode and validate the journal data
            Journal memory journal = abi.decode(journalData, (Journal));
            require(journal.tokenContract == tokenContract, "Invalid token address");
            require(Steel.validateCommitment(journal.commitment), "Invalid commitment");

            // Verify the proof
            bytes32 journalHash = sha256(journalData);
            verifier.verify(seal, imageID, journalHash);

            counter += 1;
        }

        /// @inheritdoc ICounter
        function get() external view returns (uint256) {
            return counter;
        }
    }

    ${contractData}

    Please provide your analysis in a structured format.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 4096,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to analyze contract with Claude');
    }

    const result = await response.json() as ClaudeResponse;
    return result.content[0].text;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // Handle API requests
        if (url.pathname === '/api/upload') {
            if (request.method !== 'POST') {
                return new Response('Method not allowed', { status: 405 });
            }

            try {
                const contractData = await request.text();

                // Analyze the contract with Claude
                const analysis = await analyzeContractWithClaude(contractData, env.ANTHROPIC_API_KEY);

                return new Response(JSON.stringify({ analysis }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                return new Response('Error processing contract: ' + (error as Error).message, {
                    status: 500
                });
            }
        }

        // Serve the frontend for all other routes
        return new Response(HTML, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    },
}; 