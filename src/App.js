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
import React from 'react';
import General from './page/General.jsx';
import Engines from './page/Engines.jsx';
import About from './page/About.jsx';
import Export from './page/Export.jsx';
import FindInPage from './page/FindInPage.jsx';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { createClient } from "webdav";
import { version } from './Version.js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function saveConfigToScript (notification) {
    var saveMessage = new CustomEvent('saveConfig', {
        detail: {
            searchData: window.searchData, 
            notification: !!notification
        }
    });
    document.dispatchEvent(saveMessage);
}

async function saveToWebdav() {
    if (!window.searchData.webdavConfig) return;
    const client = createClient(window.searchData.webdavConfig.host, {
        username: window.searchData.webdavConfig.username,
        password: window.searchData.webdavConfig.password
    });
    const path = "/SearchJumper" + (window.searchData.webdavConfig.path || "").replace(/^\/*/, "/").replace(/\/+$/, "");
    if (await client.exists(path + "/") === false) {
        await client.createDirectory(path);
    }
    await client.putFileContents(path + "/lastModified", "" + window.searchData.lastModified);
    await client.putFileContents(path + "/sitesConfig.json", JSON.stringify(window.searchData.sitesConfig));
    if (window.searchData.prefConfig.inPageRule) {
        await client.putFileContents(path + "/inPageRule.json", JSON.stringify(window.searchData.prefConfig.inPageRule))
    }
}

window.saveToWebdav = saveToWebdav;

async function refreshByWebdav(callback) {
  if (!window.searchData.webdavConfig) return;
  const client = createClient(window.searchData.webdavConfig.host, {
    username: window.searchData.webdavConfig.username,
    password: window.searchData.webdavConfig.password
  });
  const path = "/SearchJumper" + (window.searchData.webdavConfig.path || "").replace(/^\/*/, "/").replace(/\/+$/, "");
  if (await client.exists(path + "/") === false) {
      let pathArr = path.split("/");
      await pathArr.reduce(async (targetPath, curPath) => {
        if (await targetPath !== "") {
          if (await client.exists((await targetPath) + "/") === false) {
            await client.createDirectory(await targetPath);
          }
        }
        if (curPath !== "") {
          return (await targetPath) + "/" + curPath;
        } else return (await targetPath);
      }, "");
      if (await client.exists(path + "/") === false) {
        await client.createDirectory(path);
      }
      await client.putFileContents(path + "/lastModified", "");
  } else if (await client.exists(path + "/lastModified") === false) {
      await client.putFileContents(path + "/lastModified", "");
  }
  let lastModified = await client.getFileContents(path + "/lastModified", { format: "text" });
  lastModified = parseFloat(lastModified) || 0;
  if (lastModified && (!window.searchData.lastModified || lastModified > window.searchData.lastModified)) {
    window.searchData.lastModified = lastModified;
    if (await client.exists(path + "/sitesConfig.json")) {
      let sitesConfig = await client.getFileContents(path + "/sitesConfig.json", { format: "text" });
      sitesConfig = JSON.parse(sitesConfig);
      window.searchData.sitesConfig = sitesConfig;
    }
    if (await client.exists(path + "/inPageRule.json")) {
      let inPageRule = await client.getFileContents(path + "/inPageRule.json", { format: "text" });
      inPageRule = JSON.parse(inPageRule);
      window.searchData.prefConfig.inPageRule = inPageRule;
    }
    saveConfigToScript();
    callback();
  } else if (lastModified === 0 || window.searchData.lastModified > lastModified) {
    await client.putFileContents(path + "/lastModified", "" + window.searchData.lastModified);
    await client.putFileContents(path + "/sitesConfig.json", JSON.stringify(window.searchData.sitesConfig));
    await client.putFileContents(path + "/inPageRule.json", JSON.stringify(window.searchData.prefConfig.inPageRule))
  }
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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    document.documentElement.scrollTop = 0;
  };
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
    if (!/^(http|ftp)/i.test(window.location.protocol)) {
      fetch("https://search.hoothin.com/sjsponsors.svg").then(res => res.text()).then(text => {
        document.getElementById("sponsors").innerHTML = text;
      });
    }
    window.addEventListener('message',function(e){
      if (e.data.command === 'loadConfig') {
        window.searchData = e.data.searchData;
        window.version = e.data.version;
        if (window.searchData.prefConfig.lang && window.searchData.prefConfig.lang !== '0') {
          window.setLang(window.searchData.prefConfig.lang);
        }
        var receivedMessage = new Event('received');
        document.dispatchEvent(receivedMessage);
        setInited(true);
        refreshByWebdav(() => {
          setInited(true);
          window.postMessage({
              command: 'refresh'
          }, '*');
        }).catch(e => {
            handleAlertOpen(window.i18n('webdavDisabled') + '\n' + e.toString());
            window.webdavDisabled = true;
        });
      }
      return true;
    }, true);
  }, [])

  return (
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
            <Tab label={window.i18n('general')} {...a11yProps(0)} />
            <Tab label={window.i18n('searchEngines')} {...a11yProps(1)} />
            <Tab label={window.i18n('findInPage')} {...a11yProps(2)} />
            <Tab label={window.i18n('exportConfig')} {...a11yProps(3)} />
            <Tab label={window.i18n('about')} {...a11yProps(4)} />
          </Tabs>
          {/^(http|ftp)/i.test(window.location.protocol) ? <embed className="sponsors" wmode="transparent" src="https://search.hoothin.com/sjsponsors.svg"/> : <div id="sponsors" className="sponsors"></div>}
        </ListItem>
      </List>
      <TabPanel value={value} index={0} sx={{width:1}}>
        {window.searchData ? <General/> : <About/>}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {window.searchData ? <Engines/> : <About/>}
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
  );
}
