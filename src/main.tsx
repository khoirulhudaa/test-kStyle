import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { RotateSpinner } from 'react-spinners-kit'
import App from './App.tsx'
import './index.css'

const LoadingFallback = () => {
  return (
    <div className='flex fixed top-0 left-0 z-[99999999999] items-center w-screen h-screen justify-center'>
      <RotateSpinner size={70} color="#36D7B7" loading={true} />
  </div>
  )
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </Router>
  </React.StrictMode>,
)
