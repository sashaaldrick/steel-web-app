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
    <!-- Add Prism.js for syntax highlighting -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
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
            font-family: inherit;
            max-height: 500px;
            overflow-y: auto;
        }
        .success {
            background: #e6f4ea;
        }
        .error {
            background: #fce8e6;
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
        
        /* Contract display styles */
        .contract-container {
            margin: 20px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .contract-header {
            background-color: #f5f5f5;
            padding: 10px 15px;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            color: #333;
        }
        .contract-code {
            padding: 15px;
            background-color: #f8f8f8;
            overflow-x: auto;
        }
        .contract-code pre {
            margin: 0;
            padding: 0;
            background: transparent;
        }
        .contract-code code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
        }
        
        /* Markdown styles */
        #status h1, #status h2, #status h3 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: #333;
        }
        #status h1 {
            font-size: 1.8em;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.3em;
        }
        #status h2 {
            font-size: 1.5em;
        }
        #status h3 {
            font-size: 1.3em;
        }
        #status p {
            margin: 0.8em 0;
            line-height: 1.6;
        }
        #status ul, #status ol {
            padding-left: 2em;
            margin: 0.8em 0;
        }
        #status pre {
            background-color: #f6f8fa;
            border-radius: 3px;
            padding: 16px;
            overflow: auto;
            margin: 1em 0;
        }
        #status code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            background-color: rgba(27, 31, 35, 0.05);
            border-radius: 3px;
            padding: 0.2em 0.4em;
            font-size: 85%;
        }
        #status pre code {
            background-color: transparent;
            padding: 0;
            font-size: 100%;
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
        // Initialize Prism.js after dynamic content is loaded
        function highlightCode() {
            if (window.Prism) {
                Prism.highlightAll();
            }
        }
        
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
                    // Use innerHTML instead of textContent to render the HTML
                    status.innerHTML = data.analysis;
                    status.className = 'success';
                    
                    // Apply syntax highlighting
                    highlightCode();
                } else {
                    throw new Error('Analysis failed');
                }
            } catch (error) {
                status.textContent = 'Error analyzing contract. Please try again.';
                status.className = 'error';
            }
        });
    </script>
    
    <!-- Add Prism.js for syntax highlighting -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-solidity.min.js"></script>
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

    from this basic erc20 counter solidity example:

    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

    contract OnChainERC20Counter {
    address public tokenContract;
    uint256 public counter;
    
    function checkBalance(address accountAddress) public view returns (uint256) {
        return IERC20(tokenContract).balanceOf(accountAddress);
    }
    
    // this function will only update the counter if the account has a valid balance > 1
    function increment(address accountAddress) public {
        require(checkBalance(accountAddress) > 1, "balance must be greater than 1");
        counter += 1;
        }
    }   

    to this fully Steelified contract:


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

    Please provide your response in a structured format. Format your analysis using HTML for better display (headings, lists, etc.). Place the contract code in a block with the tags <contract> and </contract>, so that it can be displayed properly.`;

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
    const responseText = result.content[0].text;

    // Parse the contract code from the response
    return parseContractFromResponse(responseText);
}

/**
 * Parses the contract code from the Claude response and formats it for display
 * @param responseText The raw text response from Claude
 * @returns Formatted HTML with the contract code in a nice text box
 */
function parseContractFromResponse(responseText: string): string {
    // Check if the response contains contract tags
    const contractRegex = /<contract>([\s\S]*?)<\/contract>/;
    const match = responseText.match(contractRegex);

    if (match && match[1]) {
        // Extract the contract code
        let contractCode = match[1].trim();

        // Check if the contract code is wrapped in a code block
        const codeBlockRegex = /```(?:solidity)?\s*([\s\S]*?)```/;
        const codeBlockMatch = contractCode.match(codeBlockRegex);

        if (codeBlockMatch && codeBlockMatch[1]) {
            // If it's in a code block, extract just the code
            contractCode = codeBlockMatch[1].trim();
        }

        // Split the response into parts: before contract, contract, and after contract
        const parts = responseText.split(/<contract>[\s\S]*?<\/contract>/);
        const beforeContract = parts[0] || '';
        const afterContract = parts[1] || '';

        // Since we're now getting HTML directly from Claude, we don't need to convert from markdown
        // Just sanitize the HTML to prevent XSS attacks
        const sanitizedBeforeHtml = sanitizeHtml(beforeContract);
        const sanitizedAfterHtml = sanitizeHtml(afterContract);

        // Create the final HTML with the contract in a nice text box
        return `
            ${sanitizedBeforeHtml}
            <div class="contract-container">
                <div class="contract-header">
                    Smart Contract
                </div>
                <div class="contract-code">
                    <pre><code class="language-solidity">${escapeHtml(contractCode)}</code></pre>
                </div>
            </div>
            ${sanitizedAfterHtml}
        `;
    }

    // If no contract tags found, return the sanitized HTML response
    return sanitizeHtml(responseText);
}

/**
 * Basic HTML sanitizer to prevent XSS attacks
 * For a production app, consider using a library like DOMPurify
 * @param html The HTML to sanitize
 * @returns Sanitized HTML
 */
function sanitizeHtml(html: string): string {
    // This is a very basic sanitizer that allows common HTML tags
    // For a real application, use a proper sanitizer library

    // In a Cloudflare Worker environment, we don't have access to the DOM
    // So we'll use a simple regex-based approach to remove potentially dangerous elements

    // Remove script tags and their contents
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers (onclick, onload, etc.)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

    // Remove javascript: URLs
    sanitized = sanitized.replace(/\s+href\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi, ' href="#"');

    // Remove other potentially dangerous attributes
    sanitized = sanitized.replace(/\s+eval\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    sanitized = sanitized.replace(/\s+expression\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

    return sanitized;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param text The text to escape
 * @returns Escaped HTML text
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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