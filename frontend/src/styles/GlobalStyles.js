import { createGlobalStyle } from 'styled-components';
import { device } from './breakpoints';

const GlobalStyles = createGlobalStyle`
  html {
    font-size: 16px;
    
    @media ${device.xs} {
      font-size: 14px;
    }
    
    @media ${device.sm} {
      font-size: 15px;
    }
    
    @media ${device.lg} {
      font-size: 16px;
    }
  }

  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .container {
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;

    @media ${device.sm} {
      max-width: 540px;
    }

    @media ${device.md} {
      max-width: 720px;
    }

    @media ${device.lg} {
      max-width: 960px;
    }

    @media ${device.xl} {
      max-width: 1140px;
    }
  }
`;

export default GlobalStyles;
