// Temporary test file - simple App to check if React works
import { useState } from 'react';

function App() {
  const [test, setTest] = useState('React is working!');
  
  return (
    <div style={{ padding: '50px', fontSize: '24px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'green' }}>{test}</h1>
      <button 
        onClick={() => setTest('Button clicked! React is working!')}
        style={{ padding: '10px 20px', fontSize: '16px', marginTop: '20px' }}
      >
        Test Button
      </button>
    </div>
  );
}

export default App;


