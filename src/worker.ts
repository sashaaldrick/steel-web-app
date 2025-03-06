interface Env {
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
        <h1>Contract Uploader</h1>
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
            status.textContent = 'Uploading...';
            status.className = '';

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: file
                });

                if (response.ok) {
                    status.textContent = 'Contract uploaded successfully!';
                    status.className = 'success';
                } else {
                    throw new Error('Upload failed');
                }
            } catch (error) {
                status.textContent = 'Error uploading contract. Please try again.';
                status.className = 'error';
            }
        });
    </script>
</body>
</html>`;

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

                // Here you would typically:
                // 1. Validate the contract
                // 2. Store it somewhere (e.g., KV store, R2, etc.)
                // 3. Process it as needed

                return new Response('SUCCESS', {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                });
            } catch (error) {
                return new Response('Error processing contract', { status: 500 });
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