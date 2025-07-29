import { NextRequest, NextResponse } from 'next/server';

// Development-only comprehensive debugging page
export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>🦈 Calendar Debug Dashboard</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1e293b, #1e40af);
            color: white;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(30, 41, 59, 0.8);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          .section {
            margin: 20px 0;
            padding: 20px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }
          .btn {
            background: linear-gradient(45deg, #2563eb, #06b6d4);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
          }
          .btn:hover { transform: scale(1.05); }
          pre { 
            background: rgba(0,0,0,0.3); 
            padding: 15px; 
            border-radius: 8px; 
            overflow-x: auto;
            white-space: pre-wrap;
            font-size: 12px;
          }
          .status { 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0; 
          }
          .success { background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.3); }
          .error { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); }
          .info { background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🦈 School of Sharks - Calendar Debug Dashboard</h1>
          
          <div class="section">
            <h2>🎯 Current Issue</h2>
            <div class="info status">
              Workout assignments are saved to database but not displaying in calendar
            </div>
          </div>

          <div class="section">
            <h2>📊 Debug Actions</h2>
            <button class="btn" onclick="checkAthlete33()">Check Athlete 33 Workouts</button>
            <button class="btn" onclick="checkAllAthletes()">Check All Athletes</button>
            <button class="btn" onclick="openCoachPage()">Open Coach Page</button>
            <button class="btn" onclick="createTestWorkout()">Create Another Test Workout</button>
          </div>

          <div class="section">
            <h2>📋 Debug Results</h2>
            <div id="results" class="info status">
              Click debug actions above to see results...
            </div>
          </div>

          <div class="section">
            <h2>🔍 Today's Date Check</h2>
            <div class="success status" id="dateInfo">
              Today: ${new Date().toISOString().split('T')[0]} (${new Date().toDateString()})
            </div>
          </div>

          <div class="section">
            <h2>✅ What's Working</h2>
            <ul>
              <li>✅ Authentication bypass working</li>
              <li>✅ API endpoints responding correctly</li>
              <li>✅ Database saving workout assignments</li>
              <li>✅ Backend returning workout data</li>
              <li>✅ Frontend fetching workouts successfully</li>
            </ul>
          </div>

          <div class="section">
            <h2>🎯 Next Steps</h2>
            <ul>
              <li>🔍 Check browser console logs in coach page</li>
              <li>🔍 Verify date format matching in calendar component</li>
              <li>🔍 Check if calendar is showing workouts for correct date</li>
            </ul>
          </div>
        </div>

        <script>
          const backendUrl = 'http://localhost:3000/api';
          const resultsDiv = document.getElementById('results');

          function showResult(message, type = 'info') {
            resultsDiv.className = \`\${type} status\`;
            resultsDiv.innerHTML = message;
          }

          async function checkAthlete33() {
            try {
              showResult('Loading athlete 33 workouts...', 'info');
              const response = await fetch(\`\${backendUrl}/dev-debug-workouts/33\`);
              const data = await response.json();
              
              if (data.success) {
                showResult(\`
                  <h3>🦈 Athlete 33 Workouts:</h3>
                  <strong>Total Workouts:</strong> \${data.data.total_workouts}<br>
                  <strong>Workouts for Today (2025-07-29):</strong> \${data.data.workouts_for_today.length}<br>
                  <pre>\${JSON.stringify(data.data, null, 2)}</pre>
                \`, 'success');
              } else {
                showResult(\`Error: \${data.error}\`, 'error');
              }
            } catch (error) {
              showResult(\`Network Error: \${error.message}\`, 'error');
            }
          }

          async function checkAllAthletes() {
            try {
              showResult('Loading all athletes...', 'info');
              const response = await fetch(\`\${backendUrl}/dev-debug-users\`);
              const data = await response.json();
              
              if (data.success) {
                showResult(\`
                  <h3>👥 All Athletes:</h3>
                  <pre>\${JSON.stringify(data.data, null, 2)}</pre>
                \`, 'success');
              } else {
                showResult(\`Error: \${data.error}\`, 'error');
              }
            } catch (error) {
              showResult(\`Network Error: \${error.message}\`, 'error');
            }
          }

          function openCoachPage() {
            window.open('http://localhost:3000/coach', '_blank');
            showResult('Coach page opened in new tab. Check browser console for calendar debug logs!', 'info');
          }

          async function createTestWorkout() {
            try {
              showResult('Creating test workout assignment...', 'info');
              const response = await fetch(\`\${backendUrl}/dev-test-assignment\`);
              const data = await response.json();
              
              if (data.success) {
                showResult(\`
                  <h3>✅ Test Workout Created:</h3>
                  <p>\${data.message}</p>
                  <p><strong>Instructions:</strong> \${data.instructions}</p>
                  <pre>\${JSON.stringify(data.data, null, 2)}</pre>
                \`, 'success');
              } else {
                showResult(\`Error: \${data.error || data.message}\`, 'error');
              }
            } catch (error) {
              showResult(\`Network Error: \${error.message}\`, 'error');
            }
          }

          // Auto-load athlete 33 data on page load
          window.onload = function() {
            checkAthlete33();
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
