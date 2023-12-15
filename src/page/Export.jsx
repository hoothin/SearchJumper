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
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RedeemIcon from '@mui/icons-material/Redeem';

const apiUrl = 'https://search.hoothin.com/api.php';
const myWebDavUrl = 'https://webdav.hoothin.com';
async function checkWebdav(host, username, password, pathname) {
    const client = createClient(host, {
        username: username,
        password: password
    });
    const path = "/SearchJumper" + (pathname || "").replace(/^\/*/, "/").replace(/\/+$/, "");
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

var sharePass = '';
async function loadSharePass(cb) {
    if (!window.searchData.webdavConfig || window.searchData.webdavConfig.host !== myWebDavUrl) return;
    let {host, username, password, path} = window.searchData.webdavConfig;
    const client = createClient(host, {
        username: username,
        password: password
    });
    const _path = "/SearchJumper" + (path || "").replace(/^\/*/, "/").replace(/\/+$/, "");
    if (await client.exists(_path + "/sharePass") === false) {
        return '';
    }
    sharePass = await client.getFileContents(_path + "/sharePass", { format: "text" });
    cb();
    return sharePass;
}


async function saveSharePass(_sharePass) {
    if (!window.searchData.webdavConfig || window.searchData.webdavConfig.host !== myWebDavUrl) return;
    sharePass = _sharePass;
    let {host, username, password, path} = window.searchData.webdavConfig;
    const client = createClient(host, {
        username: username,
        password: password
    });
    const _path = "/SearchJumper" + (path || "").replace(/^\/*/, "/").replace(/\/+$/, "");
    await client.putFileContents(_path + "/sharePass", _sharePass);
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
};
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

function FreeWebDav(props) {
    if (sharePass === "") loadSharePass(() => {
        setSharePass(sharePass);
    });
    const [_sharePass, setSharePass] = React.useState(sharePass);
    if (!window.searchData.webdavConfig) return;
    return (
        <Dialog open={props.open} onClose={() => {props.close()}}>
            <DialogTitle>{window.i18n('freeWebDavShare')}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 1, mb: 1 }} variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password">{window.i18n('sharePassword')}</InputLabel>
                  <OutlinedInput
                    fullWidth
                    inputProps={{maxLength:"20"}}
                    value={_sharePass}
                    onChange={e => {
                        setSharePass(e.target.value);
                    }}
                    label={window.i18n('sharePassword')}
                  />
                </FormControl>
                <DialogContentText sx={{textAlign: 'center'}}>
                    {window.i18n('shareTips', window.searchData.webdavConfig.username.replace('user_', ''))}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="success" sx={{position: 'absolute', top: '15px', right: '23px'}} startIcon={<FileCopyIcon />} onClick={() => {
                    navigator.clipboard.writeText(window.i18n('shareText', [window.searchData.webdavConfig.username.replace('user_', ''), _sharePass || 'none']))
                        .then(() => {
                        props.handleAlertOpen('Share text copied to clipboard', 3);
                    })
                        .catch((error) => {
                        props.handleAlertOpen('Failed to copy text: ', error);
                    });
                    props.close();
                }}>{window.i18n('copy')}</Button>
                <Button onClick={() => { props.close() }}>{window.i18n('cancel')}</Button>
                <Button onClick={() => {
                    saveSharePass(_sharePass);
                    props.close();
                }}>{window.i18n('save')}</Button>
            </DialogActions>
        </Dialog>
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
       setHost(_host);
       setUsername(_username);
       setPassword(_password);
       setPath(_path);
    }, [props.open, _host, _username, _password, _path]);
    return (
        <Dialog open={props.open} onClose={() => {props.close()}}>
            <DialogTitle>{window.i18n('sync')}</DialogTitle>
            <DialogContent>
                <Button variant="contained" color="success" sx={{position: 'absolute', top: '15px', right: '23px'}} startIcon={<RedeemIcon />} onClick={() => {
                    props.requestAccount();
                    props.close();
                }}>{window.i18n('freeWebdav')}</Button>
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
                    inputProps={{maxLength:"20"}}
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
    const [openFreeWebDav, setFreeWebDav] = React.useState(false);
    const [cssText, setCssText] = React.useState(window.searchData.prefConfig.cssText || '');
    const [templateData, setTemplateData] = React.useState(window.searchData.prefConfig.templateData || {});
    const [fontAwesomeCss, setFontAwesomeCss] = React.useState(window.searchData.prefConfig.fontAwesomeCss);

    const [refresh, setRefresh] = React.useState(false);
    React.useEffect(() => {
        refresh && setTimeout(() => setRefresh(false), 0)
    }, [refresh]);
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
    var inputingTimer;
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

    function importData(data) {
        if (!data) return;
        if (data.cacheIcon) {
          var saveMessage = new CustomEvent('importCache', {
              detail: {
                  cacheData: data
              }
          });
          document.dispatchEvent(saveMessage);
        } else if (data.sitesConfig && data.prefConfig) {
          editor.set({json: data.sitesConfig});
          window.searchData = data;
          saveConfigToScript(true);
        } else if (data.sitesConfig && !data.prefConfig) {
          editor.set({json: data.sitesConfig});
          window.searchData.sitesConfig = data.sitesConfig;
          saveConfigToScript(true);
        } else if (!data.sitesConfig && data.prefConfig) {
          Object.keys(data.prefConfig).forEach(key => {
            let v = data.prefConfig[key];
            if (key && v) window.searchData.prefConfig[key] = v;
          });
          saveConfigToScript(true);
        } else {
          if (Array && Array.isArray && Array.isArray(data)) {
            if (!data[0] || !data[0].type) {
              handleAlertOpen("Not valid config");
              return;
            }
            editor.set({json: data});
            saveConfig();
          } else {
            Object.keys(data).forEach(key => {
              let v = data[key];
              if (key && v) window.searchData.prefConfig[key] = v;
            });
            saveConfigToScript(true);
          }
        }
    }

    function importConfig(event) {
        let reader = new FileReader();
        reader.readAsText(event.target.files[0]);
        reader.onload = function() {
            let jsonData = JSON.parse(this.result);
            importData(jsonData);
        };
    }

    async function ImportFromClipboard(event) {
      let content = await navigator.clipboard.readText();
      if (!content) {
        handleAlertOpen("No content");
        return;
      }
      try {
        content = JSON.parse(content);
        importData(content);
      } catch (e) {
        handleAlertOpen(e.toString());
      }
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

    var requesting = false;
    function requestAccount() {
        if (window.searchData.webdavConfig && window.searchData.webdavConfig.host === myWebDavUrl) {
            setFreeWebDav(true);
            return;
        }
        if (requesting) return;
        if (!window.confirm(window.i18n('freeWebdavConfirm'))) return;
        requesting = true;
        handleAlertOpen(window.i18n('requestAccount'), 1);
        fetch(apiUrl, {
            method: 'POST',
            mode: "cors",
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=getUser'
        })
        .then(response => response.json())
        .then(json => {
            requesting = false;
            if (json.result === 1) {
                checkWebdav(myWebDavUrl, json.username, json.password, '/').then(() => {
                    handleAlertOpen(window.i18n("success"), 3);
                    setFreeWebDav(true);
                }).catch(e => {
                    handleAlertOpen(e.toString());
                });
            } else {
                handleAlertOpen(json.message);
            }
        })
        .catch(error => handleAlertOpen(String(error)));
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
                    validator={window.location.protocol === "chrome-extension:" ? null : createAjvValidator(schema)}
                />
            </Box>
            <Accordion defaultExpanded={true} sx={{ maxHeight: '30vh', overflow: 'auto' }}>
                <AccordionSummary
                  sx={{background: '#f9f9f9', position: 'sticky', top: 0, minHeight: '45px!important', maxHeight: '45px!important'}}
                  expandIcon={<ExpandMoreIcon />}
                  id="template-header"
                >
                    <Typography sx={{display: 'block', width: '100%', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em'}} title={window.i18n("templateTips")}>{window.i18n("templateTitle")}</Typography>
                    <IconButton sx={{fontSize: '30px', height: '24px', position: "absolute", color: "rgba(0, 0, 0, 0.54)"}} key='addTemplate' 
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            let templateName = prompt(window.i18n("templateName"));
                            if (!templateName) return;
                            let templateValue = prompt(window.i18n("templateValue"));
                            if (!templateValue) return;
                            templateData[templateName] = templateValue;
                            setTemplateData(templateData);
                            setRefresh(true);
                            window.searchData.prefConfig.templateData = templateData;
                            saveConfigToScript();
                        }}
                    >
                    <AddCircleOutlineIcon />
                    </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                {Object.keys(templateData).map((key, index) =>
                    <Box sx={{ flexGrow: 1, display: 'flex'}} key={index}>
                        <TextField
                            id={"template" + index}
                            label={key}
                            fullWidth
                            type="password"
                            sx={{mb : 1}}
                            value={templateData[key]}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                var newData = {...templateData, [key]: event.target.value};
                                setTemplateData(newData);
                                clearTimeout(inputingTimer);
                                inputingTimer = setTimeout(() => {
                                    window.searchData.prefConfig.templateData = newData;
                                    saveConfigToScript();
                                }, 500);
                            }}
                            onFocus={e => {
                                e.target.type = "text";
                            }}
                            onBlur={e => {
                                e.target.type = "password";
                            }}
                        />
                        <Button variant="outlined" color="error" sx={{ textWrap: "nowrap", margin: "0 0 8px 8px"}} startIcon={<DeleteIcon />} 
                            onClick={()=>{
                                delete templateData[key];
                                setTemplateData(templateData);
                                setRefresh(true);
                                window.searchData.prefConfig.templateData = templateData;
                                saveConfigToScript();
                            }}
                        >
                            {window.i18n('delete')}
                        </Button>
                    </Box>
                )}
                </AccordionDetails>
            </Accordion>
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
                sx={{ position: 'fixed', bottom: '5%', right: 16 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    key='Save'
                    sx={{ backgroundColor: 'rgb(25, 118, 210)', color: 'white', transform: 'scale(1.1)' }}
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
                <SpeedDialAction
                    key='ImportFromClipboard'
                    icon=<ContentPasteGoIcon />
                    tooltipTitle={window.i18n('importFromClipboard')}
                    onClick = {ImportFromClipboard}
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
                <SpeedDialAction
                    sx={{backgroundColor: 'darkorange', color: 'white', transform: 'scale(1.1)'}}
                    key='Redeem'
                    icon=<RedeemIcon />
                    tooltipTitle={window.i18n('freeWebdav')}
                    onClick = {() => {
                        requestAccount();
                    }}
                />
            </DefaultOpenSpeedDial>
            <SyncEdit
                requestAccount={requestAccount}
                handleAlertOpen={handleAlertOpen}
                open={openSync}
                close={() => {setOpenSync(false)}}
            />
            <FreeWebDav
                handleAlertOpen={handleAlertOpen}
                open={openFreeWebDav}
                close={() => {setFreeWebDav(false)}}
            />
            <Snackbar open={alertBody.openAlert} autoHideDuration={5000} anchorOrigin={{vertical: 'top', horizontal: 'center'}} onClose={handleAlertClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity={alertBody.alertType} sx={{ width: '100%' }} >
                  {alertBody.alertContent}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}