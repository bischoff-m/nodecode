import Node from '@/components/Node';
import NodeCanvas from '@/components/NodeCanvas';
import theme from '@/styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

export default function App() {
  // TODO:
  // https://react-dnd.github.io/react-dnd/about

  return (
    <div style={{ overflow: 'hidden' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <NodeCanvas />
      </ThemeProvider>
    </div>
  )
}