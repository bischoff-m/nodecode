import theme from './styles/theme';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import { TypographyStyle } from '@mui/material';

export default function App() {
  return (
    // <div>
    //   <div>
    //     Titel
    //   </div>
    //   <div>

    //   </div>
    // </div>
    <Card>
      <CardHeader
        title='Mein Titel'
      />
      <CardContent>
        Content
      </CardContent>
    </Card>
  )
}
