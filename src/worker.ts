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
    </style>
</head>
<body>
    <div class="upload-container">
        <h1>Smart Contract Analyzer</h1>
        <input type="file" id="contractFile" accept=".sol" style="display: none;">
        <button class="upload-button" onclick="document.getElementById('contractFile').click()">
            Upload Contract
        </button>
        <div id="status"></div>
    </div>

    <script>
        document.getElementById('contractFile').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const status = document.getElementById('status');
            status.textContent = 'Analyzing contract...';
            status.className = '';

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: file
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
    const prompt = `You are a smart contract expert. Please analyze the following smart contract and provide a detailed analysis of its security, functionality, and potential improvements. Focus on identifying any vulnerabilities or best practices that aren't being followed.

Contract:
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
            model: 'claude-3-opus-20240229',
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