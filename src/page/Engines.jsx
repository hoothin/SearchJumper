import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';

function saveConfigToScript (notification) {
    var saveMessage = new CustomEvent('saveConfig', {
        detail: {
            searchData: window.searchData, 
            notification: !!notification
        }
    });
    document.dispatchEvent(saveMessage);
}

function TypeEdit(props) {
    const [typeData, setTypeData] = React.useState(props.data);

    React.useEffect(() => {
        setTypeData(props.data);
    }, [props.data])

    function closeTypeEdit(update) {
        if (update) {
            if (!typeData.type) return props.handleAlertOpen(window.i18n('errorNoType'));
            props.changeType(typeData);
        }
        props.closeHandler();
    }

    return (
        <Dialog open={props.typeOpen} onClose={() => {closeTypeEdit(false)}}>
            <DialogTitle>{window.i18n('editType')}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label={window.i18n('typeName')}
                    type="text"
                    fullWidth
                    variant="standard"
                    value={typeData.type}
                    onChange={e => {
                        setTypeData({ ...typeData, type:e.target.value });
                    }}
                />
                <TextField
                    margin="dense"
                    id="icon"
                    label={window.i18n('typeIcon')}
                    type="text"
                    fullWidth
                    variant="standard"
                    value={typeData.icon}
                    onChange={e => {
                        setTypeData({ ...typeData, icon:e.target.value });
                    }}
                />
                <DialogContentText>
                    {window.i18n('iconTips')}
                </DialogContentText>
                <TextField
                    margin="dense"
                    id="match"
                    label={window.i18n('typeMatch')}
                    type="text"
                    fullWidth
                    variant="standard"
                    value={typeData.match}
                    onChange={e => {
                        setTypeData({ ...typeData, match:e.target.value });
                    }}
                />
                <DialogContentText>
                    {window.i18n('typeMatchTips')}
                </DialogContentText>
                <Box style={{textAlign: "center", border: "1px solid rgba(0, 0, 0, 0.42)", borderRadius: "10px"}}>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={typeData.selectTxt} 
                                    name="enableSelTxt"
                                    onClick={e => {
                                        setTypeData({ ...typeData, selectTxt:e.target.checked });
                                    }}
                                />
                            }
                            label={window.i18n('typeEnableSelTxt')}
                            labelPlacement="top"
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={typeData.selectImg} 
                                    name="enableSelImg"
                                    onClick={e => {
                                        setTypeData({ ...typeData, selectImg:e.target.checked });
                                    }}
                                />
                            }
                            label={window.i18n('typeEnableSelImg')}
                            labelPlacement="top"
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={typeData.selectVideo} 
                                    name="enableSelVideo"
                                    onClick={e => {
                                        setTypeData({ ...typeData, selectVideo:e.target.checked });
                                    }}
                                />
                            }
                            label={window.i18n('typeEnableSelVideo')}
                            labelPlacement="top"
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={typeData.selectAudio} 
                                    name="enableSelAudio"
                                    onClick={e => {
                                        setTypeData({ ...typeData, selectAudio:e.target.checked });
                                    }}
                                />
                            }
                            label={window.i18n('typeEnableSelAudio')}
                            labelPlacement="top"
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={typeData.selectLink} 
                                    name="enableSelLink"
                                    onClick={e => {
                                        setTypeData({ ...typeData, selectLink:e.target.checked });
                                    }}
                                />
                            }
                            label={window.i18n('typeEnableSelLink')}
                            labelPlacement="top"
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={typeData.selectPage} 
                                    name="enableSelPage"
                                    onClick={e => {
                                        setTypeData({ ...typeData, selectPage:e.target.checked });
                                    }}
                                />
                            }
                            label={window.i18n('typeEnableSelPage')}
                            labelPlacement="top"
                        />
                    </FormControl>
                </Box>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <FormControlLabel
                        control={
                            <Switch 
                                checked={typeData.openInNewTab} 
                                name="openInNewTab"
                                onClick={e => {
                                    setTypeData({ ...typeData, openInNewTab:e.target.checked });
                                }}
                            />
                        }
                        label={window.i18n('typeOpenInNewTab')}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={props.handleDeleteType}>{window.i18n('delete')}</Button>
                <Button onClick={() => { closeTypeEdit(false) }}>{window.i18n('cancel')}</Button>
                <Button onClick={() => { closeTypeEdit(true) }}>{window.i18n('edit')}</Button>
            </DialogActions>
        </Dialog>
    );
}

class SitesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: props.data, openSiteEdit: false, currentSite: siteObject(false)};

        this.editSite = null;
        this.openTypeEdit = props.openTypeEdit;
        this.handleAlertOpen = props.handleAlertOpen;

        this.openSiteEdit = this.openSiteEdit.bind(this);
        this.closeSiteEdit = this.closeSiteEdit.bind(this);
        this.handleDeleteSite = this.handleDeleteSite.bind(this);
        this.changeSitePos = this.changeSitePos.bind(this);
    }

    getMinSiteData(siteData) {
        let obj = {};
        if (siteData.name) {
            obj.name = siteData.name;
        }
        if (siteData.url) {
            obj.url = siteData.url;
        }
        if (siteData.icon) {
            obj.icon = siteData.icon;
        }
        if (siteData.keywords) {
            obj.keywords = siteData.keywords;
        }
        if (siteData.match) {
            obj.match = siteData.match;
        }
        if (siteData.charset) {
            obj.charset = siteData.charset;
        }
        if (siteData.shortcut) {
            obj.shortcut = siteData.shortcut;
        }
        if (siteData.ctrl) {
            obj.ctrl = siteData.ctrl;
        }
        if (siteData.alt) {
            obj.alt = siteData.alt;
        }
        if (siteData.shift) {
            obj.shift = siteData.shift;
        }
        if (siteData.meta) {
            obj.meta = siteData.meta;
        }
        if (siteData.nobatch) {
            obj.nobatch = siteData.nobatch;
        }
        if (siteData.hideNotMatch) {
            obj.hideNotMatch = siteData.hideNotMatch;
        }
        return obj;
    }

    openSiteEdit(data) {
        this.editSite = data;
        let currentSite = siteObject(data);
        this.setState(prevState => ({
            openSiteEdit: true,
            currentSite: currentSite
        }));
    }

    closeSiteEdit(update) {
        if (update) {
            if (!this.state.currentSite.name) return this.handleAlertOpen(window.i18n('needName'));
            if (!this.state.currentSite.url) return this.handleAlertOpen(window.i18n('needUrl'));
            if (this.editSite) {
                let newSites = this.state.data.sites.map(site => {
                    if (site.url === this.editSite.url) {
                        return this.getMinSiteData(this.state.currentSite);
                    }
                    return site;
                })
                let newType = {...this.state.data, sites: newSites};
                window.searchData.sitesConfig = window.searchData.sitesConfig.map(data =>{
                    if (this.state.data.type === data.type) {
                        return newType;
                    }
                    return data;
                });
                this.setState(prevState => ({
                    data: newType
                }));
            } else {
                let newSites = this.state.data.sites.concat([this.getMinSiteData(this.state.currentSite)])
                let newType = {...this.state.data, sites: newSites};
                window.searchData.sitesConfig = window.searchData.sitesConfig.map(data =>{
                    if (this.state.data.type === data.type) {
                        return newType;
                    }
                    return data;
                });
                this.setState(prevState => ({
                    data: newType
                }));
            }
            saveConfigToScript();
        }
        this.setState(prevState => ({
            openSiteEdit: false
        }));
    }

    handleDeleteSite() {
        this.setState(prevState => ({
            openSiteEdit: false
        }));
        let newSites = this.state.data.sites.filter(site => {
            return (site.url !== this.editSite.url);
        })
        let newType = {...this.state.data, sites: newSites};
        window.searchData.sitesConfig = window.searchData.sitesConfig.map(data =>{
            if (this.state.data.type === data.type) {
                return newType;
            }
            return data;
        });
        this.setState(prevState => ({
            data: newType
        }));
        saveConfigToScript();
    }

    changeSitePos(targetSite, dragSite) {
        let newSites = this.state.data.sites.filter(site => {
            return (site.url !== dragSite.url);
        })
        for (let i in newSites) {
            if (newSites[i].url === targetSite.url) {
                newSites.splice(i, 0, dragSite);
                break;
            }
        }
        let newType = {...this.state.data, sites: newSites};
        window.searchData.sitesConfig = window.searchData.sitesConfig.map(data =>{
            if (this.state.data.type === data.type) {
                return newType;
            }
            return data;
        });
        this.setState(prevState => ({
            data: newType
        }));
        saveConfigToScript();
    }

    render() {
        return (
            <Box elevation={5} component={Paper} sx={{p: '20px', mt: 2}}>
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    <IconButton color="primary" key='editType' onClick={() => { this.openTypeEdit(this.state.data) }}>
                        <EditIcon />
                    </IconButton>
                </Box>

                <Box sx={{flexGrow: 1, display: 'flex', flexWrap: 'wrap'}}>
                    {this.state.data.sites.map((site) => (
                        <IconButton draggable='true' onDrop={e => {this.changeSitePos(site, this.dragSite)}} onDragStart={e => {this.dragSite = site}} onDragOver={e => {e.preventDefault()}} color="primary" key={site.name} title={site.name}  onClick={() => { this.openSiteEdit(site) }}>
                            <Avatar sx={{m:1}} alt={site.name} src={site.icon||site.url.replace(new RegExp('(https?://[^/]*/).*$'), "$1favicon.ico")} />
                        </IconButton>
                    ))}
                    <IconButton color="primary" key='addType' onClick={() => { this.openSiteEdit(false); }}>
                        <AddCircleOutlineIcon sx={{fontSize: '50px'}} />
                    </IconButton>
                </Box>
                <Dialog open={this.state.openSiteEdit} onClose={() => this.closeSiteEdit(false)}>
                    <DialogTitle>{window.i18n('editSite')}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label={window.i18n('siteName')}
                            type="text"
                            fullWidth
                            variant="standard"
                            value={this.state.currentSite.name}
                            onChange={e => {
                                this.setState(prevState => ({
                                    currentSite: {...this.state.currentSite, name: e.target.value}
                                }));
                            }}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="url"
                            label={window.i18n('siteUrl')}
                            type="text"
                            fullWidth
                            variant="standard"
                            value={this.state.currentSite.url}
                            onChange={e => {
                                this.setState(prevState => ({
                                    currentSite: {...this.state.currentSite, url: e.target.value}
                                }));
                            }}
                            placeholder="https://www.google.com/search?q=%s"
                        />
                        <DialogContentText>
                            {window.i18n('siteUrlTips')}
                        </DialogContentText>
                        <TextField
                            margin="dense"
                            id="icon"
                            label={window.i18n('siteIcon')}
                            type="text"
                            fullWidth
                            variant="standard"
                            value={this.state.currentSite.icon}
                            onChange={e => {
                                this.setState(prevState => ({
                                    currentSite: {...this.state.currentSite, icon: e.target.value}
                                }));
                            }}
                        />
                        <TextField
                            margin="dense"
                            id="keywords"
                            label={window.i18n('siteKeywords')}
                            type="text"
                            fullWidth
                            variant="standard"
                            value={this.state.currentSite.keywords}
                            onChange={e => {
                                this.setState(prevState => ({
                                    currentSite: {...this.state.currentSite, keywords: e.target.value}
                                }));
                            }}
                        />
                        <TextField
                            margin="dense"
                            id="match"
                            label={window.i18n('siteMatch')}
                            type="text"
                            fullWidth
                            variant="standard"
                            value={this.state.currentSite.match}
                            onChange={e => {
                                this.setState(prevState => ({
                                    currentSite: {...this.state.currentSite, match: e.target.value}
                                }));
                            }}
                        />
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={this.state.currentSite.hideNotMatch} 
                                        name="hideNotMatch"
                                        onClick={e => {
                                            this.setState(prevState => ({
                                                currentSite: {...prevState.currentSite, hideNotMatch: e.target.checked}
                                            }));
                                        }}
                                    />
                                }
                                label={window.i18n('hideNotMatch')}
                            />
                        </FormControl>
                        <Box sx={{flexGrow: 1, display: 'flex', flexWrap: 'nowrap'}}>
                            <TextField
                                margin="dense"
                                id="match"
                                label={window.i18n('siteShotcut')}
                                type="text"
                                variant="outlined"
                                value={this.state.currentSite.shortcut}
                                inputProps={{ maxLength: 1 }}
                                onChange={e => {
                                    this.setState(prevState => ({
                                        currentSite: {...this.state.currentSite, shortcut: e.target.value}
                                    }));
                                }}
                            />
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={this.state.currentSite.ctrl} 
                                            name="ctrl"
                                            onClick={e => {
                                                this.setState(prevState => ({
                                                    currentSite: {...prevState.currentSite, ctrl: e.target.checked}
                                                }));
                                            }}
                                        />
                                    }
                                    label='Ctrl'
                                    labelPlacement="bottom"
                                />
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={this.state.currentSite.alt} 
                                            name="alt"
                                            onClick={e => {
                                                this.setState(prevState => ({
                                                    currentSite: {...prevState.currentSite, alt: e.target.checked}
                                                }));
                                            }}
                                        />
                                    }
                                    label='Alt'
                                    labelPlacement="bottom"
                                />
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={this.state.currentSite.shift} 
                                            name="shift"
                                            onClick={e => {
                                                this.setState(prevState => ({
                                                    currentSite: {...prevState.currentSite, shift: e.target.checked}
                                                }));
                                            }}
                                        />
                                    }
                                    label='Shift'
                                    labelPlacement="bottom"
                                />
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={this.state.currentSite.meta} 
                                            name="meta"
                                            onClick={e => {
                                                this.setState(prevState => ({
                                                    currentSite: {...prevState.currentSite, meta: e.target.checked}
                                                }));
                                            }}
                                        />
                                    }
                                    label='Meta'
                                    labelPlacement="bottom"
                                />
                            </FormControl>
                        </Box>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={this.state.currentSite.nobatch} 
                                        name="nobatch"
                                        onClick={e => {
                                            this.setState(prevState => ({
                                                currentSite: {...prevState.currentSite, nobatch: e.target.checked}
                                            }));
                                        }}
                                    />
                                }
                                label={window.i18n('nobatch')}
                            />
                        </FormControl>
                        <Autocomplete
                            disablePortal
                            margin="dense"
                            sx={{ mt: 5 }}
                            id="charset"
                            fullWidth
                            variant="standard"
                            options={allCharset}
                            value={this.state.currentSite.charset}
                            onChange={e => {
                                this.setState(prevState => ({
                                    currentSite: {...this.state.currentSite, charset: e.target.textContent}
                                }));
                            }}
                            renderInput={(params) => <TextField 
                                {...params}
                                label={window.i18n('siteCharset')} 
                            />}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" style={{display:this.editSite?'':'none'}} color="error" startIcon={<DeleteIcon />} onClick={this.handleDeleteSite}>{window.i18n('delete')}</Button>
                        <Button onClick={() => this.closeSiteEdit(false)}>{window.i18n('cancel')}</Button>
                        <Button onClick={() => this.closeSiteEdit(true)}>{window.i18n('edit')}</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}

const allCharset = [
  "","gbk","gb18030","big5","big5-hkscs","utf-8","utf-16le","shift-jis","euc-jp","iso-2022-jp","euc-kr","iso-2022-kr","macintosh","koi8-r","koi8-u",
    "windows-1250","windows-1251","windows-1252","windows-1253","windows-1254","windows-1255","windows-1256","windows-1257","windows-1258",
    "iso-8859-1","iso-8859-2","iso-8859-3","iso-8859-4","iso-8859-5","iso-8859-6","iso-8859-7","iso-8859-8","iso-8859-8-i","iso-8859-9","iso-8859-10","iso-8859-11","iso-8859-13","iso-8859-14","iso-8859-15","iso-8859-16"
];

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

function typeObject(obj) {
    obj = obj || {};
    return {
        type: obj.type || '',
        icon: obj.icon || '',
        match: obj.match || '',
        selectTxt: obj.selectTxt || false,
        selectImg: obj.selectImg || false,
        selectAudio: obj.selectAudio || false,
        selectVideo: obj.selectVideo || false,
        selectLink: obj.selectLink || false,
        selectPage: obj.selectPage || false,
        openInNewTab: obj.openInNewTab || false
    };
}

function siteObject(obj) {
    obj = obj || {};
    return {
        name: obj.name || '',
        url: obj.url || '',
        icon: obj.icon || '',
        keywords: obj.keywords || '',
        match: obj.match || '',
        charset: obj.charset || '',
        shortcut: obj.shortcut || '',
        ctrl: obj.ctrl || false,
        alt: obj.alt || false,
        shift: obj.shift || false,
        meta: obj.meta || false,
        nobatch: obj.nobatch || false,
        hideNotMatch: obj.hideNotMatch || false
    };
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
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Engines() {
    const [value, setValue] = React.useState(0);

    const [editTypeOpen, setTypeOpen] = React.useState(false);
    const [editTypeData, setTypeData] = React.useState(typeObject(false));

    const [alertBody, setAlert] = React.useState({openAlert: false, alertContent: '', alertType: 'error'});

    const [refresh, setRefresh] = React.useState(false);
     
    React.useEffect(() => {
        refresh && setTimeout(() => setRefresh(false))
    }, [refresh]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const openTypeEdit = editType => {
        if (editType) {
            for (let i in window.searchData.sitesConfig) {
                if (window.searchData.sitesConfig[i].type === editType.type) {
                    editType = window.searchData.sitesConfig[i];
                    break;
                }
            }
        }
        setTypeData(typeObject(editType));
        setTypeOpen(true);
    };

    const getMinTypeData = (typeData) => {
        let minType = {};
        if (typeData.type) {
            minType.type = typeData.type;
        }
        if (typeData.icon) {
            minType.icon = typeData.icon;
        }
        if (typeData.match) {
            minType.match = typeData.match;
        }
        if (typeData.selectTxt) {
            minType.selectTxt = typeData.selectTxt;
        }
        if (typeData.selectImg) {
            minType.selectImg = typeData.selectImg;
        }
        if (typeData.selectAudio) {
            minType.selectAudio = typeData.selectAudio;
        }
        if (typeData.selectVideo) {
            minType.selectVideo = typeData.selectVideo;
        }
        if (typeData.selectLink) {
            minType.selectLink = typeData.selectLink;
        }
        if (typeData.selectPage) {
            minType.selectPage = typeData.selectPage;
        }
        if (typeData.openInNewTab) {
            minType.openInNewTab = typeData.openInNewTab;
        }
        minType.sites = typeData.sites;
        return minType;
    };

    const changeType = (newType) => {
        let newData;
        if (editTypeData.type === '') {
            if (!newType || newType.type === '') return;
            newData = window.searchData.sitesConfig.concat([{...getMinTypeData(newType), sites: []}])
        } else {
            if (newType === false) {
                newData = window.searchData.sitesConfig.filter(data =>{
                    return (editTypeData.type !== data.type)
                });
                let newValue = value - 1;
                if (newValue < 0) newValue = 0;
                setValue(newValue);
            } else {
                newData = window.searchData.sitesConfig.map(data =>{
                    if (editTypeData.type === data.type) {
                        newType.sites=data.sites;
                        return getMinTypeData(newType);
                    }
                    return data;
                });
                setTypeData(newType);
            }
        }
        window.searchData.sitesConfig=newData;
        saveConfigToScript();
    };

    const handleDeleteType = () => {
        changeType(false);
        setTypeOpen(false);
    };

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
            alertType: 'error'
        });
    };

    const changeTypePos = (targetType, dragType) => {
        let newTypes = window.searchData.sitesConfig.filter(typeData => {
            return (typeData.type !== dragType.type);
        })
        for (let i in newTypes) {
            if (newTypes[i].type === targetType.type) {
                newTypes.splice(i, 0, dragType);
                break;
            }
        }
        window.searchData.sitesConfig = newTypes;
        saveConfigToScript();
        setRefresh(true);
    };
    var dragType;

    return (
        <Box>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('searchEngines')}</h2>
            </Paper>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', flexGrow: 1, display: 'flex' }}>
                <Tabs value={value} onChange={handleChange} aria-label="types" variant="scrollable" scrollButtons="auto">
                    {window.searchData.sitesConfig.map((data, index) =>
                        <Tab  
                            draggable='true'
                            onDrop={e => {changeTypePos(data, dragType)}} 
                            onDragStart={e => {dragType = data}} 
                            onDragOver={e => {e.preventDefault()}} 
                            icon={
                                /^(http|data:)/.test(data.icon)?(
                                    <img alt={data.type} src={data.icon} style={{m:1, background: 'darkgray', borderRadius: '15px'}} />
                                ):(
                                    <i style={{background: 'darkgray', lineHeight: '65px', width: '50px', fontSize: '30px', color: 'white', borderRadius: '15px'}} className={`fa fa-${data.icon}`}/>
                                )} 
                            label={data.type} 
                            key={index} 
                            {...a11yProps(index)} 
                        />
                    )}
                </Tabs>
                <IconButton color="primary" onClick={() => {openTypeEdit(false)}}>
                    <AddCircleOutlineIcon sx={{fontSize: '30px'}}/>
                </IconButton>
            </Box>
            {window.searchData.sitesConfig.map((data, index) =>
                <TabPanel value={value} index={index} key={data.type}>
                    <SitesList data={data} openTypeEdit={openTypeEdit} handleAlertOpen={handleAlertOpen}/>
                </TabPanel>
            )}
            <TypeEdit 
                typeOpen={editTypeOpen}
                data={editTypeData} 
                handleDeleteType={handleDeleteType} 
                handleAlertOpen={handleAlertOpen}
                changeType={changeType}
                closeHandler={() => {setTypeOpen(false)}}
            />
            <Snackbar open={alertBody.openAlert} autoHideDuration={2000} anchorOrigin={{vertical: 'top', horizontal: 'center'}} onClose={handleAlertClose}>
                <MuiAlert elevation={6} variant="filled" onClose={handleAlertClose} severity={alertBody.alertType} sx={{ width: '100%' }} >
                  {alertBody.alertContent}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}