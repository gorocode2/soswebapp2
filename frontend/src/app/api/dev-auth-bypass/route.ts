import { NextRequest, NextResponse } from 'next/server';

// Development-only route for bypassing authentication
// This should NEVER be deployed to production

export async function GET(_request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
  }

  try {
    // Create HTML page with automatic authentication setup
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>🦈 Development Auth Bypass</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1e293b, #1e40af, #1e293b);
              color: white;
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .container {
              text-align: center;
              max-width: 400px;
              padding: 30px;
              background: rgba(30, 41, 59, 0.8);
              border-radius: 20px;
              border: 1px solid rgba(59, 130, 246, 0.3);
            }
            .btn {
              background: linear-gradient(45deg, #2563eb, #06b6d4);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              margin: 10px;
              transition: all 0.3s;
            }
            .btn:hover {
              transform: scale(1.05);
            }
            .warning {
              background: rgba(251, 191, 36, 0.2);
              border: 1px solid rgba(251, 191, 36, 0.4);
              padding: 15px;
              border-radius: 10px;
              margin: 20px 0;
              color: #fbbf24;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🦈 School of Sharks</h1>
            <h2>Development Auth Bypass</h2>
            
            <div class="warning">
              <strong>⚠️ Development Mode Only</strong><br>
              This bypasses authentication for testing purposes.
            </div>
            
            <button class="btn" onclick="setAuthAndRedirect()">
              🦈 Login as Test Coach & Go to Coach Page
            </button>
            
            <button class="btn" onclick="clearAuth()">
              🗑️ Clear Test Authentication
            </button>
            
            <p>
              <strong>Test User:</strong><br>
              Email: testing@only.com<br>
              Role: Coach
            </p>
          </div>

          <script>
            const DEV_TEST_USER = {
              id: 1,
              uuid: '12345678-1234-5678-9012-123456789012',
              email: 'testing@only.com',
              username: 'testcoach',
              firstName: 'Test',
              lastName: 'Coach',
              fitnessLevel: 'intermediate',
              createdAt: new Date().toISOString(),
            };

            const DEV_TEST_TOKEN = 'dev-test-token-12345';

            function setAuthAndRedirect() {
              try {
                localStorage.setItem('sharks_auth_token', DEV_TEST_TOKEN);
                localStorage.setItem('sharks_user_data', JSON.stringify(DEV_TEST_USER));
                alert('✅ Test authentication set successfully!');
                window.location.href = '/coach';
              } catch (error) {
                alert('❌ Failed to set authentication: ' + error.message);
                console.error('Error:', error);
              }
            }

            function clearAuth() {
              localStorage.removeItem('sharks_auth_token');
              localStorage.removeItem('sharks_user_data');
              alert('🗑️ Test authentication cleared');
              window.location.href = '/auth';
            }

            // Check current auth status
            window.onload = function() {
              const token = localStorage.getItem('sharks_auth_token');
              if (token) {
                document.querySelector('.container').innerHTML += 
                  '<p style="color: #10b981; margin-top: 20px;">✅ Authentication is currently set</p>';
              }
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('❌ Dev auth bypass error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
