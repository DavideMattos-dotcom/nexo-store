import React from 'react';
import {createRoot} from 'react-dom/client';
import Store from './Store';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Store/></React.StrictMode>);
