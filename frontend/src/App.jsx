import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [apiData, setApiData] = useState(null);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setApiData(data);
        setStatus('online');
      } else {
        setStatus('offline');
        setApiData(null);
      }
    } catch (error) {
      console.error('API connection failed:', error);
      setStatus('offline');
      setApiData(null);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="card">
      <div className="status-container">
        <div className={`status-dot ${status}`}></div>
        <span className="status-text">
          {status === 'checking' && 'Checking connection...'}
          {status === 'online' && 'Backend Connected'}
          {status === 'offline' && 'Backend Offline'}
        </span>
      </div>

      <h1>SiteChat Platform</h1>
      <p className="subtitle">
        Your basic frontend and backend setup is ready. Run the servers and start building your real-time chat workspace.
      </p>

      <button className="btn-refresh" onClick={checkStatus} disabled={status === 'checking'}>
        {status === 'checking' ? 'Connecting...' : 'Test Connection'}
      </button>

      {apiData && (
        <div className="details">
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value" style={{ color: '#10b981' }}>{apiData.status}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Server Time</span>
            <span className="detail-value">
              {new Date(apiData.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Uptime</span>
            <span className="detail-value">
              {Math.floor(apiData.uptime)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
