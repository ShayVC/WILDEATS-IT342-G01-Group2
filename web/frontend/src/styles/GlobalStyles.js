import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #800020; /* Maroon */
    --primary-light: #a03050;
    --primary-dark: #600010;
    --white: #f8f8f8; /* Mid white */
    --gray: #e0e0e0; /* Light gray */
    --gray-dark: #a0a0a0;
    --text-dark: #333;
    --text-light: #f8f8f8;
    --transition: all 0.3s ease;
    --border-radius: 6px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--white);
    color: var(--text-dark);
    line-height: 1.6;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    font-weight: 600;
    color: var(--primary);
  }

  a {
    text-decoration: none;
    color: var(--primary);
    transition: var(--transition);
    
    &:hover {
      color: var(--primary-light);
    }
  }

  button {
    cursor: pointer;
    border: none;
    background-color: var(--primary);
    color: var(--white);
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-weight: 500;
    font-size: 1rem;
    transition: var(--transition);
    
    &:hover {
      background-color: var(--primary-light);
      transform: translateY(-2px);
    }
    
    &:disabled {
      background-color: var(--gray-dark);
      cursor: not-allowed;
    }
  }

  input, select, textarea {
    border: 1px solid var(--gray-dark);
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius);
    font-size: 1rem;
    width: 100%;
    transition: var(--transition);
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary-light);
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .card {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 1.5rem;
  }

  .section {
    padding: 4rem 0;
  }
`;

export default GlobalStyles;
