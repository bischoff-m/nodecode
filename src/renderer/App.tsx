import NodeCanvas from '@/components/NodeCanvas';
import theme from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

export default function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <NodeCanvas />
      </ThemeProvider>
    </div>
  )
}