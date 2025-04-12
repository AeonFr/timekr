import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import saveAs from 'file-saver';
import useStore from '../store';

import ProjectsList from './Projects/List';
import Icon from './Icon';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [darkInterface, setDarkInterface] = useState('0');
  const [showImportForm, setShowImportForm] = useState(false);
  const [cookieConsentAccepted, setCookieConsentAccepted] = useState(
    localStorage.getItem('cookie_consent') || false
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { pathname } = useLocation();
  
  const projects = useStore(state => state.projects);
  const importProjects = useStore(state => state.importProjects);

  // Apply dark interface effect
  useEffect(() => {
    if (darkInterface === '1') {
      document.body.classList.add('dark-interface');
    } else {
      document.body.classList.remove('dark-interface');
    }
  }, [darkInterface]);

  const handleDarkInterfaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDarkInterface(e.target.value);
  };

  const acceptCookieConsent = () => {
    setCookieConsentAccepted(true);
    localStorage.setItem('cookie_consent', '1');
  };

  const exportData = () => {
    const data = projects;
    const blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
    saveAs(blob, "timekr.json");
  };

  const importData = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileInputRef.current) return false;
    
    const file = fileInputRef.current.files?.[0];
    if (!file) return false;
    
    const fr = new FileReader();
    
    fr.onloadend = (evt) => {
      if (evt.target?.readyState !== 2) return;
      if (evt.target.error) {
        alert('Error while reading file');
        return;
      }
      
      try {
        if (!window.confirm('All existing data will be replaced. Are you sure you want to continue?')) {
          return;
        }
        
        const projectsData = JSON.parse(evt.target.result as string);
        importProjects(projectsData);
        
        setShowImportForm(false);
        return true;
      } catch (e) {
        alert('Error during file evaluation! The file is probably in the incorrect format - JSON.parse failed');
        console.log(e);
        return false;
      }
    };
    
    fr.readAsText(file);
  };

  return (
    <section className="container font-sans">
      <div className="m:flex flex-row-reverse mb-4">
        <main className="childs-animated w-full m:w-2/3 px-4 mt-4">
          {children}
        </main>
        
        <aside className="w-full m:w-1/3 px-4 mt-8 m:mt-2">
          <Link
            to="/"
            className="flex items-center no-underline text-1 mb-3"
          >
            <img
              src="/assets/logo.png"
              className="w-8 mr-4"
              alt="Logo"
            />
            <h1 className="text-xl tracking-wide uppercase leading-loose">
              Timekr
            </h1>
          </Link>

          <ProjectsList />
          
          <h1 className="text-xl tracking-wide uppercase font-light leading-loose">
            Interface
          </h1>
          <div>
            <label
              className={`inline-block btn ${
                darkInterface === '0' ? 'btn-primary' : 'btn-default'
              }`}
            >
              <input
                className="hidden"
                type="radio"
                name="interface"
                value="0"
                checked={darkInterface === '0'}
                onChange={handleDarkInterfaceChange}
              />
              <Icon name="sun" />
              Light
            </label>
            <label
              className={`inline-block btn ${
                darkInterface === '1' ? 'btn-primary' : 'btn-default'
              }`}
            >
              <input
                className="hidden"
                type="radio"
                name="interface"
                value="1"
                checked={darkInterface === '1'}
                onChange={handleDarkInterfaceChange}
              />
              <Icon name="moon" />
              Dark
            </label>
          </div>
          
          <h1 className="mt-4 text-xl tracking-wide uppercase font-light leading-loose">
            My Data
          </h1>
          <button
            className="btn btn-default"
            onClick={exportData}
          >
            <Icon name="download-cloud" />
            Export
          </button>
          <button
            className="btn btn-default"
            onClick={() => setShowImportForm(true)}
          >
            <Icon name="upload-cloud" />
            Import
          </button>

          {showImportForm && (
            <form
              className="mt-2 show-ltr"
              onSubmit={importData}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="py2 btn btn-primary max-w-full overflow-hidden"
                accept=".json"
              />
              <button
                type="submit"
                className="btn btn-primary"
              >
                import
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowImportForm(false)}
              >
                cancel
              </button>
            </form>
          )}
        </aside>
      </div>
      
      {!cookieConsentAccepted && (
        <div className="border p-4 my-4 rounded-lg leading-normal show-ltr">
          This site uses both Cookies and <code>localStorage</code> to store your user data
          (it should be safe unless you decide to clear your cache).
          Any data you provide is saved on your current browser and device <em>only</em>.
          The server doesn't store any data whatsoever,
          so you're adviced to keep regular backups using the Export function.
          <button
            className="btn btn-primary mt-2"
            onClick={acceptCookieConsent}
          >
            I understand
          </button>
        </div>
      )}
    </section>
  );
};

export default Layout;
