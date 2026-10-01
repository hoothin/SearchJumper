import logo from './logo.svg';
// import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import General from './page/General.jsx';
import Appearance from './page/Appearance.jsx';
import Engines from './page/Engines.jsx';
import About from './page/About.jsx';
import Export from './page/Export.jsx';
import FindInPage from './page/FindInPage.jsx';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { configRequest, setConfig } from './configBridge';
import { version } from './Version.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}



function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{width: '100%'}}
      {...other}
    >
      {value === index && (
        <Container>
          {children}
        </Container>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}
export default function App() {
  const [value, setValue] = React.useState(4);
  const [inited, setInited] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      return localStorage.getItem('sj-dark-mode') === '1';
    } catch (e) {
      return false;
    }
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    document.documentElement.scrollTop = 0;
  };
  const handleDarkModeToggle = () => {
    setDarkMode(prev => {
      const nextMode = !prev;
      try {
        localStorage.setItem('sj-dark-mode', nextMode ? '1' : '0');
      } catch (e) {
        // Ignore storage failures (private mode, disabled storage).
      }
      return nextMode;
    });
  };
  const theme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light'
      }
    });
  }, [darkMode]);
  const [alertBody, setAlert] = React.useState({openAlert: false, alertContent: '', alertType: 'error'});
  const handleAlertOpen = (content, type) => {
      switch (type) {
          case 0:
              type = "error";
          break;
          case 1:
              type = "warning";
          break;
          case 2:
              type = "info";
          break;
          case 3:
              type = "success";
          break;
          default:
              type = "error";
          break;
      }
      setAlert({
          openAlert: true,
          alertContent: content,
          alertType: type
      });
  };
  const handleAlertClose = () => {
      setAlert({
          openAlert: false,
          alertContent: '',
          alertType: alertBody.alertType
      });
  };
  React.useEffect(() => {
    if (window.isListen) return;
    window.isListen = true;
    let loading = false;
    document.addEventListener('configError', e => handleAlertOpen(e.detail));
    window.addEventListener('message', async e => {
      if (e.source !== window || e.origin !== window.location.origin || e.data?.command !== 'configReady') return;
      document.dispatchEvent(new Event('received'));
      if (loading) return;
      loading = true;
      window.splitEnabled = !!e.data.splitEnabled;
      window.version = e.data.version;
      window.cacheIcon = e.data.cacheIcon || [];
      try {
        setConfig(await configRequest('get'));
        if (window.searchData.webdavConfig) {
          try {
            setConfig(await configRequest('sync'));
            document.dispatchEvent(new Event('configSaved'));
          } catch (error) {
            window.webdavDisabled = true;
            handleAlertOpen(window.i18n('syncFailed') + '\n' + error.message);
          }
        }
        if (window.searchData.prefConfig.lang && window.searchData.prefConfig.lang !== '0') {
          window.setLang(window.searchData.prefConfig.lang);
        }
        setInited(true);
        window.postMessage({command: 'refresh'}, window.location.origin);
      } catch (error) {
        handleAlertOpen(error.message);
      } finally {
        loading = false;
      }
    });
  }, [])
  React.useEffect(() => {
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        inited={inited}
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100vh', marginLeft: '200px' }}
      >
        <List
          id="tabs"
          component={Paper}
          elevation={5}
          sx={{
            width: '200px',
            height: '100%',
            left: 0,
            maxWidth: 200,
            position: 'fixed'
          }}
        >
          <ListItem
            onClick={() => {
              document.querySelector('#tabs').classList.remove('hide');
            }}
          >
            <ListItemAvatar>
              <Link href='https://github.com/hoothin/SearchJumper' target="_blank">
                <Avatar alt="SearchJumper" component={Paper} elevation={5} src={logo}/>
              </Link>
            </ListItemAvatar>
            <ListItemText 
              primary={window.i18n('name')} 
              secondary={window.version ? ("Ver " + window.version) : (window.version === 0 ? "" : "Not installed")} 
              sx={{cursor: 'pointer'}}
              onClick={e => {inited && window.version !== 0 && window.version !== version && window.open("https://greasyfork.org/scripts/445274-searchjumper/code/SearchJumper.user.js")}}
              secondaryTypographyProps={inited && window.version !== version ? {
                sx:{color: 'red'},
                title:window.i18n('outOfDate')
              } : (!inited ? {
                sx:{color: 'red'}
              } : {})}/>
          </ListItem>
          <Divider component="li" variant="inset" sx={{marginRight: 3}}/>
          <ListItem sx={{flexFlow: 'column', height: 'calc(100% - 75px)', overflowY: 'auto', overflowX: 'hidden'}}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              scrollButtons="auto"
              value={value}
              onChange={handleChange}
              onClick={()=>{document.querySelector('#tabs').classList.add('hide')}}
              aria-label="Vertical tabs example"
              sx={{ borderRight: 1, borderColor: 'divider', width: '100%', flexShrink: 0 }}
            >
              <Tab value={0} label={window.i18n('general')} {...a11yProps(0)} />
              <Tab value={5} label={window.i18n('customAppearance')} {...a11yProps(5)} />
              <Tab value={1} label={window.i18n('searchEngines')} {...a11yProps(1)} />
              <Tab value={2} label={window.i18n('findInPage')} {...a11yProps(2)} />
              <Tab value={3} label={window.i18n('exportConfig')} {...a11yProps(3)} />
              <Tab value={4} label={window.i18n('about')} {...a11yProps(4)} />
            </Tabs>
            <Box sx={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px'}}>
              <IconButton
                size="small"
                onClick={handleDarkModeToggle}
                disabled={!inited}
                aria-label="Dark mode"
                title="Dark mode"
              >
                {darkMode ? <WbSunnyIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Box>
            <div className="sponsors" style={{position: 'relative'}}>
              <img alt="Sponsors" referrerPolicy="no-referrer" src="https://search.hoothin.com/sjsponsors.svg" style={{width: '100%', display: 'block'}}/>
              <a href="https://search.hoothin.com/set.php" target="_blank" rel="noreferrer" aria-label="Collections" style={{position: 'absolute', inset: '0 0 50%'}}/>
              <a href="https://pagetual.hoothin.com/" target="_blank" rel="noreferrer" aria-label="Pagetual" style={{position: 'absolute', inset: '50% 0 0'}}/>
            </div>
          </ListItem>
        </List>
        <TabPanel value={value} index={0} sx={{width:1}}>
          {window.searchData ? <General/> : <About/>}
        </TabPanel>
        <TabPanel value={value} index={1}>
          {window.searchData ? <Engines/> : <About/>}
        </TabPanel>
        <TabPanel value={value} index={5}>
          {window.searchData ? <Appearance/> : <About/>}
        </TabPanel>
        <TabPanel value={value} index={2}>
          {window.searchData ? <FindInPage/> : <About/>}
        </TabPanel>
        <TabPanel value={value} index={3}>
          {window.searchData ? <Export/> : <About/>}
        </TabPanel>
        <TabPanel value={value} index={4}>
          <About/>
        </TabPanel>
        <Snackbar open={alertBody.openAlert} autoHideDuration={5000} anchorOrigin={{vertical: 'top', horizontal: 'center'}} onClose={handleAlertClose}>
            <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity={alertBody.alertType} sx={{ width: '100%' }} >
              {alertBody.alertContent}
            </MuiAlert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
