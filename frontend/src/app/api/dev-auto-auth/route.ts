import { NextRequest, NextResponse } from 'next/server';

// Development-only auto-auth route
export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
  }

  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirect') || '/coach';

  // Create HTML that automatically sets auth and redirects
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>🦈 Auto Auth</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1e293b, #1e40af);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .loading {
            text-align: center;
            padding: 30px;
            background: rgba(30, 41, 59, 0.8);
            border-radius: 20px;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <h2>🦈 School of Sharks</h2>
          <p>Setting up test authentication...</p>
          <div style="margin: 20px 0;">⚡ Redirecting to ${redirect}</div>
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

          // Auto-set authentication and redirect
          try {
            localStorage.setItem('sharks_auth_token', DEV_TEST_TOKEN);
            localStorage.setItem('sharks_user_data', JSON.stringify(DEV_TEST_USER));
            console.log('🦈 DEV: Test authentication set successfully');
            
            // Redirect after a brief delay
            setTimeout(() => {
              window.location.href = '${redirect}';
            }, 1000);
            
          } catch (error) {
            console.error('❌ DEV: Failed to set test authentication:', error);
            document.querySelector('.loading').innerHTML = 
              '<h2>❌ Error</h2><p>Failed to set authentication: ' + error.message + '</p>';
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
}
