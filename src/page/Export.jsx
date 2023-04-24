import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import DeleteIcon from '@mui/icons-material/Delete';
import { JSONEditor } from 'vanilla-jsoneditor'
import { useEffect, useRef } from "react";
import 'vanilla-jsoneditor/themes/jse-theme-dark.css';
import { createAjvValidator } from 'vanilla-jsoneditor';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import DialogContentText from '@mui/material/DialogContentText';
import ImageIcon from '@mui/icons-material/Image';
import { createClient } from "webdav";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


async function checkWebdav(host, username, password, pathname) {
    const client = createClient(host, {
        username: username,
        password: password
    });
    const path = ("/SearchJumper" + (pathname || "/")).replace(/\/$/, "");
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
            if (editor) editor.set({json:window.searchData.sitesConfig});
        }
        if (await client.exists(path + "/inPageRule.json")) {
            let inPageRule = await client.getFileContents(path + "/inPageRule.json", { format: "text" });
            inPageRule = JSON.parse(inPageRule);
            window.searchData.prefConfig.inPageRule = inPageRule;
        }
    } else if (lastModified === 0 || window.searchData.lastModified > lastModified) {
        await client.putFileContents(path + "/lastModified", "" + (window.searchData.lastModified || new Date().getTime()));
        await client.putFileContents(path + "/sitesConfig.json", JSON.stringify(window.searchData.sitesConfig));
        await client.putFileContents(path + "/inPageRule.json", JSON.stringify(window.searchData.prefConfig.inPageRule))
    }
    window.searchData.webdavConfig = {
        host: host,
        username: username,
        password: password,
        path: pathname
    };
    var saveMessage = new CustomEvent('saveConfig', {
        detail: {
            searchData: window.searchData, 
            notification: false
        }
    });
    document.dispatchEvent(saveMessage);
}

function saveConfigToScript (notification) {
    if (notification) window.searchData.lastModified = new Date().getTime();
    var saveMessage = new CustomEvent('saveConfig', {
        detail: {
            searchData: window.searchData, 
            notification: !!notification
        }
    });
    document.dispatchEvent(saveMessage);
    window.saveToWebdav();
}

const presetCssList = [
`     .search-jumper-searchBarCon {
     }
     .search-jumper-searchBar {
         background: #505050;
         border-radius: 20px!important;
         border: 1px solid #b3b3b3;
         opacity: 0.3;
     }
     .search-jumper-btn {
     }
     .search-jumper-btn>i {
     }
     .search-jumper-logoBtnSvg {
     }
     .search-jumper-type {
         background: #c5c5c5;
         border-radius: 20px!important;
     }
     .search-jumper-word {
         background: black;
         color: white!important;
     }
     .search-jumper-tips {
         font-size: xx-large;
         background: #f5f5f5e0;
         border-radius: 10px!important;
         box-shadow: 0px 0px 10px 0px #000;
         color: black;
     }
     .search-jumper-searchBar .search-jumper-btn:hover {
         color: white;
     }`,
`     .search-jumper-searchBarCon {
     }
     .search-jumper-searchBar {
         background: rgb(153 153 153 / 50%);
         border-radius: 20px!important;
         border: 1px solid #c9c9c9;
         opacity: 0.3;
     }
     .search-jumper-btn {
     }
     .search-jumper-type {
         background: rgb(255 255 255 / 38%);
     }
     .search-jumper-word,a.search-jumper-word {
         background: rgb(255 255 255 / 70%);
         color: #282828!important;
     }
     .search-jumper-tips {
         background: #0A0A0Ae0;
         border-radius: 10px!important;
         box-shadow: 0px 0px 10px 0px #FFFFFF;
         font-weight: bold;
         color: white;
     }
     .search-jumper-searchBar .search-jumper-btn:hover {
         color: black;
     }
     .search-jumper-searchBar .search-jumper-btn.search-jumper-word:hover{
         background:white;
     }`
];

function UploadSpeedDialAction(props) {
    return (
        <React.Fragment>
            <input
                accept=".txt, .json"
                style={{ display: "none" }}
                id="icon-button-file"
                type="file"
                onChange={props.onChange}
            />
            <label htmlFor="icon-button-file">
                <SpeedDialAction
                    component="span"
                    {...props}
                ></SpeedDialAction>
            </label>
        </React.Fragment>
    );
}

const schema = {
    title: 'Types List',
    description: 'List of the data of types',
    type: 'array',
    items: {
        type: 'object',
        properties: {
            type: {
                title: 'Type Name',
                description: 'The name of type.',
                examples: ['Search'],
                type: 'string'
            },
            icon: {
                title: 'Type icon',
                description: 'The icon of type.',
                examples: ['image'],
                type: 'string'
            },
            sites: {
                title: 'Sites List',
                description: 'List of the data of sites',
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            title: 'Site Name',
                            description: 'The name of site.',
                            examples: ['Google'],
                            type: 'string'
                        },
                        url: {
                            title: 'Site Url',
                            description: 'The url of site.',
                            examples: ['https://www.google.com/search?q=%s'],
                            type: 'string'
                        }
                    },
                    required: ['name', 'url']
                }
            }
        },
        required: ['type', 'sites']
    }
}
var editor;

function SvelteJSONEditor(props) {
    const refContainer = useRef(null);
    const refEditor = useRef(null);

    useEffect(() => {
        refEditor.current = new JSONEditor({
            target: refContainer.current,
            props: {}
        });
        editor = refEditor.current;

        return () => {
            if (refEditor.current) {
                refEditor.current.destroy();
                refEditor.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (refEditor.current) {
            refEditor.current.updateProps(props);
        }
    }, [props]);

    return <div className="svelte-jsoneditor-react jse-theme-dark" ref={refContainer}></div>;
}

function UploadBookmarkAction(props) {
    return (
        <React.Fragment>
            <input
                accept=".html"
                style={{ display: "none" }}
                id="icon-bookmark-file"
                type="file"
                onChange={props.onChange}
            />
            <label htmlFor="icon-bookmark-file">
                <SpeedDialAction
                    component="span"
                    {...props}
                ></SpeedDialAction>
            </label>
        </React.Fragment>
    );
}

function DefaultOpenSpeedDial(props) {
    const [isOpen, setIsOpen] = React.useState(true);
    return (
        <SpeedDial
            open={isOpen}
            onClick={e => {
                if (e.target.classList.contains("MuiSpeedDialIcon-icon") || e.target.classList.contains("MuiFab-primary") || e.target.parentNode.classList.contains("MuiSpeedDialIcon-icon")) {
                    setIsOpen(!isOpen);
                }
            }}
            {...props}
        />
    );
}

function SyncEdit(props) {
    let _host = "", _username = "", _password = "", _path = "/";
    if (window.searchData.webdavConfig) {
        _host = window.searchData.webdavConfig.host;
        _username = window.searchData.webdavConfig.username;
        _password = window.searchData.webdavConfig.password;
        _path = window.searchData.webdavConfig.path || "/";
    }
    const [host, setHost] = React.useState(_host);
    const [username, setUsername] = React.useState(_username);
    const [password, setPassword] = React.useState(_password);
    const [path, setPath] = React.useState(_path);
    const [showPassword, setShowPassword] = React.useState(false);
    React.useEffect(() => {
       setPassword(_host);
       setUsername(_username);
       setPassword(_password);
       setPath(_path);
    }, [props.open]);
    return (
        <Dialog open={props.open} onClose={() => {props.close()}}>
            <DialogTitle>{window.i18n('sync')}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 1, mb: 1 }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-host">{window.i18n('host')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    id="outlined-adornment-host"
                    type='text'
                    value={host}
                    placeholder="http://127.0.0.1:1900"
                    onChange={e => {
                        setHost(e.target.value);
                    }}
                    label={window.i18n('host')}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mt: 1, mb: 1 }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-username">{window.i18n('username')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    id="outlined-adornment-username"
                    type='text'
                    value={username}
                    onChange={e => {
                        setUsername(e.target.value);
                    }}
                    label={window.i18n('username')}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mt: 1, mb: 1 }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">{window.i18n('password')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={e => setShowPassword(!showPassword)}
                          onMouseDown={e => {e.preventDefault()}}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label={window.i18n('password')}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mt: 1, mb: 1 }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-path">{window.i18n('path')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    id="outlined-adornment-path"
                    type='text'
                    value={path}
                    onChange={e => {
                        setPath(e.target.value);
                    }}
                    onBlur={e => {
                        let val = e.target.value.replace(/\/\//g, "/");
                        if (val.indexOf("/") !== 0) val = "/" + val;
                        if (val[val.length - 1] !== "/") val = val + "/";
                        setPath(val);
                    }}
                    label={window.i18n('path')}
                  />
                </FormControl>
                <DialogContentText sx={{textAlign: 'center'}}>
                    {window.i18n('syncTips')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => {
                    window.searchData.webdavConfig = null;
                    saveConfigToScript();
                    props.close();
                }}>{window.i18n('empty')}</Button>
                <Button onClick={() => { props.close() }}>{window.i18n('cancel')}</Button>
                <Button onClick={() => {
                    if (!host) return;
                    checkWebdav(host, username, password, path).then(() => {
                        props.handleAlertOpen(window.i18n("success"), 3);
                        props.close();
                    }).catch(e => {
                        props.handleAlertOpen(e.toString());
                    });
                }}>{window.i18n('save')}</Button>
            </DialogActions>
        </Dialog>
    );
}

let longHoldState = 0;
export default function Export() {
    const [presetCss, setPresetCss] = React.useState('');
    const [openSync, setOpenSync] = React.useState(false);
    const [cssText, setCssText] = React.useState(window.searchData.prefConfig.cssText||'');
    const [fontAwesomeCss, setFontAwesomeCss] = React.useState(window.searchData.prefConfig.fontAwesomeCss);

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
            alertContent: ''
        });
    };
    var downloadEle = document.createElement('a');
    downloadEle.download = "searchJumper.json";
    downloadEle.target = "_blank";
    function saveConfig() {
        try {
            if (editor) {
                if (editor.get().json) {
                    window.searchData.sitesConfig = editor.get().json;
                } else if (editor.get().text) {
                    window.searchData.sitesConfig = JSON.parse(editor.get().text);
                }
            }
            window.searchData.prefConfig.cssText = cssText;
            window.searchData.prefConfig.fontAwesomeCss = fontAwesomeCss;
            saveConfigToScript(true);
        } catch (e) {
            alert(e);
        }
    }

    function copyConfig() {
        var copyMessage = new Event('copyConfig');
        document.dispatchEvent(copyMessage);
    }

    function importConfig(event) {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0]);
        reader.onload = function() {
            let jsonData = JSON.parse(this.result);
            if (jsonData.cacheIcon) {
              var saveMessage = new CustomEvent('importCache', {
                  detail: {
                      cacheData: jsonData
                  }
              });
              document.dispatchEvent(saveMessage);
            } else if (jsonData.sitesConfig) {
              editor.set({json: jsonData.sitesConfig});
              window.searchData = jsonData;
              saveConfigToScript(true);
            } else {
              editor.set({json: jsonData});
              saveConfig();
            }
        };
    }

    function importBookmarks(event) {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0]);
        reader.onload = function() {
            var doc = null;
            try {
                doc = document.implementation.createHTMLDocument('');
                doc.documentElement.innerHTML = this.result;
            }
            catch (e) {
                console.log('parse error');
            }
            let bookmarks = {};
            let bookmarkNum = 0;
            let createNewType = typeName => {
                typeName = "BM_" + typeName;
                for (let j = 0; j < window.searchData.sitesConfig.length; j++) {
                    if (window.searchData.sitesConfig[j].type === typeName) {
                        return window.searchData.sitesConfig[j];
                    }
                }
                let newType = {type: typeName, description:'Bookmarks', icon: "bookmark", sites: [], match: "0"};
                window.searchData.sitesConfig.push(newType);
                return newType;
            }
            [].forEach.call(doc.querySelectorAll("a"), item => {
                for(let i in bookmarks) {
                    if (bookmarks[i].sites.find(site => {return item.href === site.url})) return;
                }
                for (let j = 0; j < window.searchData.sitesConfig.length; j++) {
                    if (window.searchData.sitesConfig[j].sites.find(site => {return item.href === site.url})) return;
                }
                ++bookmarkNum;
                let site = {name: (item.innerText || "bookmark") + "_" + bookmarkNum, url: item.href};
                let icon = item.getAttribute("ICON");
                if (icon) site.icon = icon;

                let parentGroup = item;
                let title = [];
                while(parentGroup) {
                  title.unshift(parentGroup.innerText);
                  parentGroup = parentGroup.parentNode &&
                    parentGroup.parentNode.parentNode &&
                    parentGroup.parentNode.parentNode.previousElementSibling &&
                    parentGroup.parentNode.parentNode.previousElementSibling.tagName.indexOf('H') === 0 &&
                    parentGroup.parentNode.parentNode.previousElementSibling;
                }
                if (!title) title = 'Bookmarks';
                else {
                  if (title.length > 3) {
                    site.description = title.slice(2, title.length - 1).join("_");
                    title = title[2];
                  } else {
                    title = title[0];
                  }
                }
                let type = bookmarks[title];
                if (!type) {
                  bookmarks[title] = createNewType(title);
                }
                bookmarks[title].sites.push(site);
            });
            if (!bookmarks || bookmarks === {}) return;
            editor.set({json:window.searchData.sitesConfig})
            saveConfigToScript(true);
        };
    }

    function webdavSync() {
        setOpenSync(true);
    }

    function exportConfig() {
        let myBlob;
        if (longHoldState === 0) {
          return;
        } else if (longHoldState === 2) {
          let editJson = editor.get().json;
          if (editJson) {
            window.searchData.sitesConfig = editJson;
          }
          let blobStr = [(JSON.stringify(window.searchData, null, 4))];
          myBlob = new Blob(blobStr, { type: "application/json" });
        } else if (longHoldState === 1) {
          let blobStr = [(JSON.stringify(editor.get().json || window.searchData.sitesConfig, null, 4))];
          myBlob = new Blob(blobStr, { type: "application/json" });
        }
        longHoldState = 0;
        downloadEle.href = window.URL.createObjectURL(myBlob);
        downloadEle.click();
    }

    function exportCache() {
      var exportMessage = new Event('downloadCache');
      document.dispatchEvent(exportMessage);
    }

    const handleChange = (event: SelectChangeEvent) => {
        setPresetCss(event.target.value);
        if (!cssText || window.confirm(window.i18n('replaceCss'))) {
            if (event.target.value === '') setCssText('');
            else setCssText(presetCssList[event.target.value]);
        }
    };
    return (
        <Box sx={{pb : 5}}>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('exportConfig')}</h2>
            </Paper>
            <Box sx={{ maxHeight: '80vh',overflow: 'auto'}}>
                <SvelteJSONEditor
                    content={{json:window.searchData.sitesConfig}}
                    validator={createAjvValidator(schema)}
                />
            </Box>
            <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>{window.i18n('presetCss')}</InputLabel>
                <Select
                    value={presetCss}
                    label={window.i18n('presetCss')}
                    onChange={handleChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={0}>Default</MenuItem>
                    <MenuItem value={1}>Light</MenuItem>
                </Select>
                <FormHelperText>{window.i18n('presetCssTips')}</FormHelperText>
            </FormControl>
            <TextField
                id="styleText"
                label={window.i18n('customCss')}
                multiline
                fullWidth
                sx={{mb : 1}}
                rows={10}
                value={cssText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCssText(event.target.value);
                }}
            />
            <TextField
                id="fontAwesomeCss"
                label={window.i18n('fontAwesomeCss')}
                fullWidth
                sx={{mb : 1}}
                value={fontAwesomeCss}
                placeholder="https://cdn.bootcdn.net/ajax/libs/font-awesome/6.1.1/css/all.min.css"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setFontAwesomeCss(event.target.value);
                }}
            />
            <DefaultOpenSpeedDial
                ariaLabel="SpeedDial"
                sx={{ position: 'fixed', bottom: '20%', right: 16 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    key='Save'
                    icon=<SaveIcon />
                    tooltipTitle={window.i18n('save')}
                    onClick = {saveConfig}
                />
                <SpeedDialAction
                    key='Copy'
                    icon=<FileCopyIcon />
                    tooltipTitle={window.i18n('copy')}
                    onClick = {copyConfig}
                />
                {window.searchData.prefConfig.cacheSwitch ?
                <SpeedDialAction
                    key='ExportCache'
                    icon=<ImageIcon />
                    tooltipTitle={window.i18n('exportCache')}
                    onClick = {exportCache}
                />
                : ""}
                <SpeedDialAction
                    key='Export'
                    icon=<FileDownloadIcon />
                    tooltipTitle={window.i18n('exportTitle')}
                    onClick = {exportConfig}
                    onMouseDown = {e => {
                      longHoldState = 1;
                      setTimeout(() => {
                        if (longHoldState === 1) { 
                          longHoldState = 2;
                          exportConfig();
                        }
                      }, 1500);
                    }}
                />
                <UploadSpeedDialAction
                    key='Import'
                    icon=<FileUploadIcon />
                    tooltipTitle={window.i18n('import')}
                    onChange = {importConfig}
                />
                <UploadBookmarkAction
                    key='Bookmarks'
                    icon=<BookmarksIcon />
                    tooltipTitle={window.i18n('importBookmarks')}
                    onChange = {importBookmarks}
                />
                <SpeedDialAction
                    key='Sync'
                    icon=<CloudSyncIcon />
                    tooltipTitle={window.i18n('sync')}
                    onClick = {webdavSync}
                />
            </DefaultOpenSpeedDial>
            <SyncEdit
                handleAlertOpen={handleAlertOpen}
                open={openSync}
                close={() => {setOpenSync(false)}}
            />
            <Snackbar open={alertBody.openAlert} autoHideDuration={2000} anchorOrigin={{vertical: 'top', horizontal: 'center'}} onClose={handleAlertClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity={alertBody.alertType} sx={{ width: '100%' }} >
                  {alertBody.alertContent}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}