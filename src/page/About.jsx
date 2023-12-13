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
import FiberPinIcon from '@mui/icons-material/FiberPin';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ShareIcon from '@mui/icons-material/Share';

export default function About() {
    return (
        <Box>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('about')}</h2>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px' }}>
            <Typography gutterBottom  component="div" style={{textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Box style={{textAlign: 'center', display: 'flex', flexWrap: 'wrap'}}>
                    <Box sx={{m: 1}}>
                        <ShareIcon/> <Link href='https://search.hoothin.com' style={{verticalAlign: 'top', color: 'darkorange', fontWeight: 'bold'}} target="_blank">{window.i18n('share')}</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        <InstallDesktopIcon/> <Link href='https://greasyfork.org/scripts/445274-searchjumper' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('install')} [Greasyfork]</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        <GitHubIcon/> <Link href='https://github.com/hoothin/SearchJumper/discussions/categories/search-engines?discussions_q=' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('rulesStore')} [Github]</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        <AllInclusiveIcon/> <Link href='https://search.hoothin.com/all' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('allPage')}</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        <FiberPinIcon/> <Link href='https://greasyfork.org/scripts/465994' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('pinyinAddon')}</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        <SpellcheckIcon/> <Link href='https://greasyfork.org/scripts/479610' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('spellAddon')}</Link>
                    </Box>
                </Box>
                <Box style={{textAlign: 'center', display: 'flex', flexWrap: 'wrap'}}>
                    <Box sx={{m: 1}}>
                        <MarkUnreadChatAltIcon/> <Link href='https://discord.gg/keqypXC6wD' style={{verticalAlign: 'top'}} target="_blank">{window.i18n('discord')}</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        <EmailIcon/> <Link href='mailto:rixixi@gmail.com' style={{verticalAlign: 'top'}} target="_blank">rixixi@gmail.com</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        Build with React.js<br/>
                    </Box>
                    <Box sx={{m: 1}}>
                        UI: <Link href='https://mui.com' target="_blank">Material-UI</Link>
                    </Box>
                    <Box sx={{m: 1}}>
                        Icons: <Link href='https://fontawesome.com/' target="_blank">FontAwesome</Link>
                    </Box>
                </Box>
                <Box style={{textAlign: 'center', display: 'flex', flexWrap: 'wrap'}}>
                </Box>
                <Card component="pre" style={{padding: '15px', lineHeight: 1.5, width: '90%', whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '0px', marginBottom: '10px'}}>
                    <img align='left' style={{width: '100px', maxWidth: '50%', boxShadow: 'rgb(0 0 0) 0px 0px 15px', marginRight: '20px', height: 'fit-content'}} src='avatar.jpg' alt='donate' loading="lazy"/>{window.i18n("donate")}
                </Card>
                <VolunteerActivismIcon/> 
                <Box className='donateLinks' sx={{ margin: '5px', borderRadius: '3px', padding: '3px' }}>
                    <Link href='https://ko-fi.com/hoothin' style={{verticalAlign: 'top'}} target="_blank">
                        <img style={{verticalAlign: 'bottom', marginRight: "5px"}} src='kofi.png' alt='kofi' loading="lazy"/>
                        [Ko-fi]
                    </Link> 
                    <span style={{margin: "0 10px"}}>|</span> 
                    <Link href='https://paypal.me/hoothin' style={{verticalAlign: 'top'}} target="_blank">
                        <img style={{verticalAlign: 'bottom', marginRight: "5px"}} src='paypal.png' alt='paypal' loading="lazy"/>
                        [Paypal.Me]
                    </Link>
                    <span style={{margin: "0 10px"}}>|</span> 
                    <Link href='https://afdian.net/@hoothin' style={{verticalAlign: 'top'}} target="_blank">
                        <img style={{verticalAlign: 'bottom', marginRight: "5px"}} src='afd.png' alt='afd' loading="lazy"/>
                        [愛發電]
                    </Link>
                </Box>
                <img style={{borderRadius: '20px', margin: '5px 10px 20px 10px'}} src='donate.jpg' className='donate' alt='donate' loading="lazy"/>
                <Box sx={{borderTop: 1, borderColor: 'divider'}}>
                <Card sx={{width: '100%', margin: '10px auto', textAlign: 'left', boxShadow: 'unset'}}>
                    <CardContent>
                        <pre style={{whiteSpace: 'pre-wrap', lineHeight: 1.5}}>
                            {window.i18n('aboutContent')}
                        </pre>
                    </CardContent>
                </Card>
                </Box>
            </Typography>
            </Paper>
        </Box>
    );
}