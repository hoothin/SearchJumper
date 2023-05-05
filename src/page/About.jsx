import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import GitHubIcon from '@mui/icons-material/GitHub';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import EmailIcon from '@mui/icons-material/Email';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

export default function About() {
    return (
        <Box>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('about')}</h2>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px' }}>
            <Typography gutterBottom  component="div" style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <GitHubIcon/> <Link href='https://github.com/hoothin/SearchJumper/issues?q=label%3A%22Sites+Rule%22' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('rulesStore')} [Github]</Link><br/>
                <InstallDesktopIcon/> <Link href='https://greasyfork.org/scripts/445274-searchjumper' style={{verticalAlign: 'top'}} target="_blank">Install [Greasyfork]</Link><br/>
                <AllInclusiveIcon/> <Link href='https://hoothin.github.io/SearchJumper/all.html' style={{verticalAlign: 'top'}} target="_blank">Tab page of all engines</Link><br/>
                <EmailIcon/> <Link href='mailto:rixixi@gmail.com' style={{verticalAlign: 'top'}} target="_blank">rixixi@gmail.com</Link><br/>
                Build with React.js<br/>
                UI: <Link href='https://mui.com' style={{verticalAlign: 'top'}} target="_blank">Material-UI</Link><br/>
                Icons: <Link href='https://fontawesome.com/' style={{verticalAlign: 'top'}} target="_blank">FontAwesome</Link><br/>
                {window.i18n("donate")}<br/>
                <VolunteerActivismIcon/> <Link href='https://buymeacoffee.com/hoothin' style={{verticalAlign: 'top'}} target="_blank">[Buy Me A Coffee]</Link>  <Link href='https://paypal.me/hoothin' style={{verticalAlign: 'top'}} target="_blank">[Paypal.Me]</Link><br/>
                <br/>
                <Box sx={{borderTop: 1, borderColor: 'divider'}}>
                <Card sx={{maxWidth: 800, margin: '10px auto', textAlign: 'left'}}>
                    <CardContent>
                        <pre style={{whiteSpace: 'pre-wrap'}}>
                            {window.i18n('aboutContent')}
                        </pre>
                    </CardContent>
                </Card>
                </Box>
                <img style={{maxWidth: '100%', borderRadius: '20px', boxShadow: 'rgb(0 0 0) 0px 0px 15px'}} src='donate.jpg' alt='donate' loading="lazy"/>
            </Typography>
            </Paper>
        </Box>
    );
}