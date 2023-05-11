import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Slider from '@mui/material/Slider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

function saveConfigToScript (notification) {
    var saveMessage = new CustomEvent('saveConfig', {
        detail: {
            searchData: window.searchData, 
            notification: !!notification
        }
    });
    document.dispatchEvent(saveMessage);
}

export default function General() {
    if (!window.searchData.prefConfig.customSize) {
        window.searchData.prefConfig.customSize = 100;
    }
    if (!window.searchData.prefConfig.longPressTime) {
        window.searchData.prefConfig.longPressTime = 500;
    }
    if (!window.searchData.prefConfig.typeOpenTime) {
        window.searchData.prefConfig.typeOpenTime = 250;
    }
    if (!window.searchData.prefConfig.leftMouse) {
        window.searchData.prefConfig.leftMouse = false;
    }
    if (!window.searchData.prefConfig.cacheSwitch) {
        window.searchData.prefConfig.cacheSwitch = false;
    }
    if (!window.searchData.prefConfig.noIcons) {
        window.searchData.prefConfig.noIcons = false;
    }
    if (!window.searchData.prefConfig.noAni) {
        window.searchData.prefConfig.noAni = false;
    }
    if (!window.searchData.prefConfig.showSiteLists) {
        window.searchData.prefConfig.showSiteLists = false;
    }
    if (!window.searchData.prefConfig.historyLength) {
        window.searchData.prefConfig.historyLength = 0;
    }
    if (!window.searchData.prefConfig.limitPopupLen) {
        window.searchData.prefConfig.limitPopupLen = 1;
    }
    if (!window.searchData.prefConfig.sortType) {
        window.searchData.prefConfig.sortType = false;
    }
    if (!window.searchData.prefConfig.altToHighlight) {
        window.searchData.prefConfig.altToHighlight = false;
    }
    if (!window.searchData.prefConfig.defaultPicker) {
        window.searchData.prefConfig.defaultPicker = false;
    }
    if (!window.searchData.prefConfig.expandType) {
        window.searchData.prefConfig.expandType = false;
    }
    if (!window.searchData.prefConfig.batchOpenConfirm) {
        window.searchData.prefConfig.batchOpenConfirm = 0;
    }
    if (typeof window.searchData.prefConfig.rightMouse === "undefined") {
        window.searchData.prefConfig.rightMouse = true;
    }
    if (!window.searchData.prefConfig.dragCtrl) {
        window.searchData.prefConfig.dragCtrl = false;
    }
    if (!window.searchData.prefConfig.dragAlt) {
        window.searchData.prefConfig.dragAlt = false;
    }
    if (!window.searchData.prefConfig.dragShift) {
        window.searchData.prefConfig.dragShift = false;
    }
    if (!window.searchData.prefConfig.alwaysShow) {
        window.searchData.prefConfig.alwaysShow = false;
    }
    if (!window.searchData.prefConfig.dragMeta) {
        window.searchData.prefConfig.dragMeta = false;
    }
    if (!window.searchData.prefConfig.showEngineWords) {
        window.searchData.prefConfig.showEngineWords = false;
    }
    if (!window.searchData.prefConfig.globalSearchNow) {
        window.searchData.prefConfig.globalSearchNow = false;
    }
    if (window.searchData.prefConfig.minPopup === false) {
        window.searchData.prefConfig.minPopup = 0;
    } else if (window.searchData.prefConfig.minPopup === true) {
        window.searchData.prefConfig.minPopup = 1;
    }
    if (!window.searchData.prefConfig.suggestType) {
        window.searchData.prefConfig.suggestType = "google";
    }
    if (typeof window.searchData.prefConfig.shiftLastUsedType === "undefined") {
        window.searchData.prefConfig.shiftLastUsedType = true;
    }
    if (typeof window.searchData.prefConfig.expandTypeLength === "undefined") {
        window.searchData.prefConfig.expandTypeLength = 12;
    }
    if (typeof window.searchData.prefConfig.lang === "undefined") {
        window.searchData.prefConfig.lang = '0';
    }
    if (typeof window.searchData.prefConfig.mouseLeaveToHide === "undefined") {
        window.searchData.prefConfig.mouseLeaveToHide = true;
    }
    if (typeof window.searchData.prefConfig.currentTypeFirst === "undefined") {
        window.searchData.prefConfig.currentTypeFirst = true;
    }
    const [state, setState] = React.useState(
        window.searchData.prefConfig
    );

    const handleSelectChange = (event: SelectChangeEvent) => {
        var newPref = {
            ...state,
            position: {
                ...state.position,
                [event.target.name]: event.target.value
            },
            offset: {
                x: 0,
                y: 0
            }
        };
        if (newPref.position.x === 'center' && newPref.position.y === 'center') {
            if (event.target.name === 'x') {
                newPref.position.y = 'top';
            } else {
                newPref.position.x = 'left';
            }
        }
        setState(newPref);
        window.searchData.prefConfig = newPref;
        saveConfigToScript();
    };
    const handleLangSelectChange = (event: SelectChangeEvent) => {
        var newPref = {
            ...state,
            lang: event.target.value
        };
        setState(newPref);
        window.searchData.prefConfig = newPref;
        saveConfigToScript();
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };
    const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        var newPref = {
            ...state,
            [event.target.name]: event.target.checked
        };
        setState(newPref);
        window.searchData.prefConfig = newPref;
        saveConfigToScript();
    };
    return (
        <Box sx={{paddingBottom: '20px'}}>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('general')}</h2>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px' }}>
                <Typography gutterBottom  component="div">
                    <h4>{window.i18n('setLang')}</h4>
                </Typography>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel>{window.i18n('lang')}</InputLabel>
                        <Select
                          value={state.lang}
                          name="lang"
                          onChange={handleLangSelectChange}
                          autoWidth
                          label={window.i18n('lang')}
                        >
                            <MenuItem value={'0'}>Default</MenuItem>
                            <MenuItem value={'en'}>English</MenuItem>
                            <MenuItem value={'zh-CN'}>简体</MenuItem>
                            <MenuItem value={'zh-TW'}>正體</MenuItem>
                        </Select>
                    </FormControl>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom  component="div">
                    <h4>{window.i18n('toolbarPosition')}</h4>
                </Typography>
                <Box
                  sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', maxWidth: '100%', flexWrap: 'wrap', alignItems: 'center' }}
                >
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel>{window.i18n('horizontal')}</InputLabel>
                        <Select
                          value={state.position.x}
                          name="x"
                          onChange={handleSelectChange}
                          autoWidth
                          label={window.i18n('horizontal')}
                        >
                            <MenuItem value={'left'}>Left</MenuItem>
                            <MenuItem value={'center'}>Center</MenuItem>
                            <MenuItem value={'right'}>Right</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel>{window.i18n('portrait')}</InputLabel>
                        <Select
                          value={state.position.y}
                          name="y"
                          onChange={handleSelectChange}
                          autoWidth
                          label={window.i18n('portrait')}
                        >
                            <MenuItem value={'top'}>Top</MenuItem>
                            <MenuItem value={'center'}>Center</MenuItem>
                            <MenuItem value={'bottom'}>Bottom</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        sx={{ m: 1, minWidth: 100 }}
                        label={window.i18n('typeOpenTime')}
                        InputProps={{
                            inputMode: 'numeric', type:'number', pattern: '[0-9]*',
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.typeOpenTime}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = parseInt(event.target.value);
                            if (newValue < 0) {
                                newValue = 0;
                            }
                            var newPref = {
                                ...state,
                                typeOpenTime: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom  component="div">
                    <h4>{window.i18n('customSize')}: {state.customSize}%</h4>
                </Typography>
                <Box
                  sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', width: '100%', flexWrap: 'wrap' }}
                >
                    <Box sx={{ width: "75%", ml: "10px", mr: "20px", mt: "15px"}}>
                        <Slider
                            value={state.customSize}
                            onChange={(event: Event, newValue: number | number[]) => {
                                if (newValue > 1000) {
                                    newValue = 1000;
                                } else if (newValue < 50) {
                                    newValue = 50;
                                }
                                var newPref = {
                                    ...state,
                                    customSize: newValue
                                };
                                setState(newPref);
                                window.searchData.prefConfig = newPref;
                                saveConfigToScript();
                            }}
                            sx={{mt:"-8px"}}
                            aria-labelledby="input-slider"
                            min={50}
                            max={1000}
                            step={10}
                            valueLabelDisplay="auto"
                            marks={[{
                                value: 100,
                                label: '100%',
                            },{
                                value: 1000,
                                label: '1000%',
                            }]}
                        />
                    </Box>
                    <TextField
                        sx={{ m: 1, minWidth: 100, width: "15%"}}
                        label={window.i18n('customSize')}
                        InputProps={{
                            inputMode: 'numeric', type:'number', pattern: '[0-9]*',
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }}
                        value={state.customSize}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            var newPref = {
                                ...state,
                                customSize: event.target.value
                            };
                            setState(newPref);
                        }}
                        onBlur={e => {
                            let newValue = parseInt(e.target.value);
                            if (newValue > 1000) {
                                newValue = 1000;
                            } else if (newValue < 50) {
                                newValue = 50;
                            }
                            var newPref = {
                                ...state,
                                customSize: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box
                    sx={{ flexGrow: 1, display: 'flex', width: '100%', flexWrap: 'wrap' }}
                >
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('initShow')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80, width: '100%', mb: '20px' }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.initShow} onChange={handleCheckChange} name="initShow" />
                                }
                                label={window.i18n('initShowTips')}
                                labelPlacement="end"
                            />
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('alwaysShow')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80, width: '100%', mb: '20px' }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.alwaysShow} onChange={handleCheckChange} name="alwaysShow" />
                                }
                                label={window.i18n('alwaysShowTips')}
                                labelPlacement="end"
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('quickAddRule')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.quickAddRule} onChange={handleCheckChange} name="quickAddRule" />
                            }
                            label={window.i18n('quickAddRuleTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('cacheSwitch')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.cacheSwitch} onChange={handleCheckChange} name="cacheSwitch" />
                            }
                            label={window.i18n('cacheSwitchTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('multiline')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel>{window.i18n('multilineLabel')}</InputLabel>
                        <Select
                            value={state.multiline}
                            onChange={(event: SelectChangeEvent) => {
                                var newPref = {
                                    ...state,
                                    multiline: event.target.value
                                };
                                setState(newPref);
                                window.searchData.prefConfig = newPref;
                                saveConfigToScript();
                            }}
                            autoWidth
                            label={window.i18n('multilineLabel')}
                        >
                            <MenuItem value={0}>{window.i18n("disable")}</MenuItem>
                            <MenuItem value={1}>{window.i18n("enable")}</MenuItem>
                            <MenuItem value={2}>{window.i18n("ask")}</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        sx={{ minWidth: 100, margin: '8px' }}
                        label={window.i18n('multilineGap')}
                        InputProps={{
                            inputMode: 'numeric', type:'number', pattern: '[0-9]*',
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.multilineGap}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = parseInt(event.target.value);
                            if (newValue < 0) {
                                newValue = 0;
                            }
                            var newPref = {
                                ...state,
                                multilineGap: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('overOpen')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.overOpen} onChange={handleCheckChange} name="overOpen" />
                            }
                            label={window.i18n('overOpenTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('openInNewTab')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.openInNewTab} onChange={handleCheckChange} name="openInNewTab" />
                            }
                            label={window.i18n('openInNewTabTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box
                    sx={{ flexGrow: 1, display: 'flex', width: '100%', flexWrap: 'wrap' }}
                >
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('historyLength')}</h4>
                        </Typography>
                        <Box
                            sx={{ flexGrow: 1, display: 'flex', width: '100%', flexWrap: 'wrap' }}
                        >
                            <TextField
                                sx={{ width: 70, margin: '8px' }}
                                label={"Number"}
                                inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                                value={state.historyLength}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    let newValue = parseInt(event.target.value);
                                    if (newValue < 0) {
                                        newValue = 0;
                                    }
                                    if (newValue > 100) {
                                        newValue = 100;
                                    }
                                    var newPref = {
                                        ...state,
                                        historyLength: newValue
                                    };
                                    setState(newPref);
                                    window.searchData.prefConfig = newPref;
                                    saveConfigToScript();
                                }}
                            />
                            <Typography gutterBottom component="div" sx={{ marginTop: '20px' }}>
                                {window.i18n('historyLengthTips')}
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('historyInsertFirst')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.historyInsertFirst} onChange={handleCheckChange} name="historyInsertFirst" />
                                }
                                label={window.i18n('historyInsertFirstTips')}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexWrap: 'wrap'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('currentTypeFirst')}</h4>
                        </Typography>
                        <Box>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.currentTypeFirst} onChange={handleCheckChange} name="currentTypeFirst" />
                                    }
                                    label={window.i18n('currentTypeFirstTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('shiftLastUsedType')}</h4>
                        </Typography>
                        <Box>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.shiftLastUsedType} onChange={handleCheckChange} name="shiftLastUsedType" />
                                    }
                                    label={window.i18n('shiftLastUsedTypeTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('sortType')}</h4>
                        </Typography>
                        <Box>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.sortType} onChange={handleCheckChange} name="sortType" />
                                    }
                                    label={window.i18n('sortTypeTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('batchOpenConfirm')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel>{window.i18n('batchOpenConfirm')}</InputLabel>
                        <Select
                            value={state.batchOpenConfirm}
                            onChange={(event: SelectChangeEvent) => {
                                var newPref = {
                                    ...state,
                                    batchOpenConfirm: event.target.value
                                };
                                setState(newPref);
                                window.searchData.prefConfig = newPref;
                                saveConfigToScript();
                            }}
                            autoWidth
                            label={window.i18n('batchOpenConfirm')}
                        >
                            <MenuItem value={0}>{window.i18n("batchOpenConfirmDefault")}</MenuItem>
                            <MenuItem value={1}>{window.i18n("batchOpenConfirmAlways")}</MenuItem>
                            <MenuItem value={2}>{window.i18n("batchOpenConfirmNo")}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('showSiteLists')}</h4>
                        </Typography>
                    
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.showSiteLists} onChange={handleCheckChange} name="showSiteLists" />
                                }
                                label={window.i18n('showSiteListsTips')}
                            />
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('alwaysShowSiteLists')}</h4>
                        </Typography>
                    
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.alwaysShowSiteLists} onChange={handleCheckChange} name="alwaysShowSiteLists" />
                                }
                                label={window.i18n('alwaysShowSiteListsTips')}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexWrap: 'wrap'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('showEngineWords')}</h4>
                        </Typography>
                        <Box>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.showEngineWords} onChange={handleCheckChange} name="showEngineWords" />
                                    }
                                    label={window.i18n('showEngineWordsTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('noIcons')}</h4>
                        </Typography>
                        <Box>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.noIcons} onChange={handleCheckChange} name="noIcons" />
                                    }
                                    label={window.i18n('noIconsTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('noAni')}</h4>
                        </Typography>
                        <Box>
                            <FormControl sx={{ m: 1, minWidth: 80 }}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.noAni} onChange={handleCheckChange} name="noAni" />
                                    }
                                    label={window.i18n('noAniTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('showCurrent')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showCurrent} onChange={handleCheckChange} name="showCurrent" />
                            }
                            label={window.i18n('showCurrentTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('expandType')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.expandType} onChange={handleCheckChange} name="expandType" />
                                }
                                label={window.i18n('expandTypeTips')}
                            />
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('expandTypeLength')}</h4>
                        </Typography>
                        <Box
                            sx={{ flexGrow: 1, display: 'flex', width: '100%', flexWrap: 'wrap' }}
                        >
                            <TextField
                                sx={{ width: 70, margin: '8px' }}
                                label={"Number"}
                                inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                                value={state.expandTypeLength}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    let newValue = parseInt(event.target.value);
                                    if (newValue < 1) {
                                        newValue = 1;
                                    }
                                    if (newValue > 100) {
                                        newValue = 100;
                                    }
                                    var newPref = {
                                        ...state,
                                        expandTypeLength: newValue
                                    };
                                    setState(newPref);
                                    window.searchData.prefConfig = newPref;
                                    saveConfigToScript();
                                }}
                            />
                            <Typography gutterBottom component="div" sx={{ marginTop: '20px' }}>
                                {window.i18n('expandTypeLengthTips')}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('autoClose')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.autoClose} onChange={handleCheckChange} name="autoClose" />
                            }
                            label={window.i18n('autoCloseTips')}
                        />
                    </FormControl>
                    <TextField
                        label={window.i18n('autoDelay')}
                        InputProps={{
                            inputMode: 'numeric', type:'number', pattern: '[0-9]*',
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.autoDelay}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            var newPref = {
                                ...state,
                                autoDelay: parseInt(event.target.value)
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('autoHideAll')}</h4>
                        </Typography>
                        <FormControl>
                          <RadioGroup
                            row
                            value={state.resizePage ? "resizePage" : (state.autoHideAll ? "autoHideAll" : "unset")}
                            onChange={event => {
                                var newPref = {
                                    ...state,
                                    "resizePage": event.target.value === "resizePage",
                                    "autoHideAll": event.target.value === "autoHideAll"
                                };
                                setState(newPref);
                                window.searchData.prefConfig = newPref;
                                saveConfigToScript();
                            }}
                          >
                            <FormControlLabel value="unset" control={<Radio />} label={window.i18n('unsetTips')} />
                            <FormControlLabel value="autoHideAll" control={<Radio />} label={window.i18n('autoHideAllTips')} />
                            <FormControlLabel value="resizePage" control={<Radio />} label={window.i18n('resizePageTips')} />
                          </RadioGroup>
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('autoHide')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.autoHide} onChange={handleCheckChange} name="autoHide" />
                                }
                                label={window.i18n('autoHideTips')}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box>
                    <Typography gutterBottom component="div">
                        <h4>{window.i18n('mouseLeaveToHide')}</h4>
                    </Typography>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.mouseLeaveToHide} onChange={handleCheckChange} name="mouseLeaveToHide" />
                            }
                            label={window.i18n('mouseLeaveToHideTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('disableAutoOpen')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.disableAutoOpen} onChange={handleCheckChange} name="disableAutoOpen" />
                                }
                                label={window.i18n('disableAutoOpenTips')}
                            />
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('hideOnSearchEngine')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.hideOnSearchEngine} onChange={handleCheckChange} name="hideOnSearchEngine" />
                                }
                                label={window.i18n('hideOnSearchEngineTips')}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('minSizeMode')}</h4>
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <FormControlLabel
                        control={
                            <Switch checked={state.minSizeMode} onChange={handleCheckChange} name="minSizeMode" />
                        }
                        label={window.i18n('minSizeModeTips')}
                    />
                </FormControl>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Box sx={{ flexGrow: 1, display: 'flex'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('enableShortcut')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.shortcut} onChange={handleCheckChange} name="shortcut" />
                                }
                                label={window.i18n('enableShortcutTips')}
                            />
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('enableInInput')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.enableInInput} onChange={handleCheckChange} name="enableInInput" />
                                }
                                label={window.i18n('enableInInputTips')}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('switchSitesKey')}</h4>
                </Typography>
                <Box>
                    <TextField
                        sx={{ mr: '10px' }}
                        label={window.i18n('switchSitesPreKey')}
                        type="text"
                        value={state.switchSitesPreKey}
                        inputProps={{ readOnly: 'readonly' }}
                        onKeyDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            let newValue = (event.key === 'Escape' || event.key === 'Backspace') ? '' : (event.code || event.key);
                            var newPref = {
                                ...state,
                                switchSitesPreKey: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                    <TextField
                        label={window.i18n('switchSitesNextKey')}
                        type="text"
                        value={state.switchSitesNextKey}
                        inputProps={{ readOnly: 'readonly' }}
                        onKeyDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            let newValue = (event.key === 'Escape' || event.key === 'Backspace') ? '' : (event.code || event.key);
                            var newPref = {
                                ...state,
                                switchSitesNextKey: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.switchSitesCtrl} onChange={handleCheckChange} name="switchSitesCtrl" />
                            }
                            label={window.i18n('ctrlKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.switchSitesAlt} onChange={handleCheckChange} name="switchSitesAlt" />
                            }
                            label={window.i18n('altKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.switchSitesShift} onChange={handleCheckChange} name="switchSitesShift" />
                            }
                            label={window.i18n('shiftKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.switchSitesMeta} onChange={handleCheckChange} name="switchSitesMeta" />
                            }
                            label={window.i18n('metaKey')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('callInputKey')}</h4>
                </Typography>
                <Box>
                    <TextField
                        label={window.i18n('shortcut')}
                        type="text"
                        value={state.shortcutKey}
                        inputProps={{ readOnly: 'readonly' }}
                        onKeyDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            let newValue = (event.key === 'Escape' || event.key === 'Backspace') ? '' : (event.code || event.key);
                            var newPref = {
                                ...state,
                                shortcutKey: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.callBarCtrl} onChange={handleCheckChange} name="callBarCtrl" />
                            }
                            label={window.i18n('ctrlKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.callBarAlt} onChange={handleCheckChange} name="callBarAlt" />
                            }
                            label={window.i18n('altKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.callBarShift} onChange={handleCheckChange} name="callBarShift" />
                            }
                            label={window.i18n('shiftKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.callBarMeta} onChange={handleCheckChange} name="callBarMeta" />
                            }
                            label={window.i18n('metaKey')}
                        />
                    </FormControl>
                </Box>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('defaultFindTab')}</h4>
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <FormControlLabel
                        control={
                            <Switch checked={state.defaultFindTab} onChange={handleCheckChange} name="defaultFindTab" />
                        }
                        label={window.i18n('defaultFindTabTips')}
                    />
                </FormControl>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('globalSearchNow')}</h4>
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <FormControlLabel
                        control={
                            <Switch checked={state.globalSearchNow} onChange={handleCheckChange} name="globalSearchNow" />
                        }
                        label={window.i18n('globalSearchNowTips')}
                    />
                </FormControl>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('disableInputOnWords')}</h4>
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <FormControlLabel
                        control={
                            <Switch checked={state.disableInputOnWords} onChange={handleCheckChange} name="disableInputOnWords" />
                        }
                        label={window.i18n('disableInputOnWordsTips')}
                    />
                </FormControl>
                <Box sx={{ flexGrow: 1, display: 'flex'}}>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('altToHighlight')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.altToHighlight} onChange={handleCheckChange} name="altToHighlight" />
                                }
                                label={window.i18n('altToHighlightTips')}
                            />
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography gutterBottom component="div">
                            <h4>{window.i18n('defaultPicker')}</h4>
                        </Typography>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.defaultPicker} onChange={handleCheckChange} name="defaultPicker" />
                                }
                                label={window.i18n('defaultPickerTips')}
                            />
                        </FormControl>
                    </Box>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('showAllKey')}</h4>
                </Typography>
                <Box>
                    <TextField
                        label={window.i18n('shortcut')}
                        type="text"
                        value={state.showAllShortcutKey}
                        inputProps={{ readOnly: 'readonly' }}
                        onKeyDown={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            let newValue = (event.key === 'Escape' || event.key === 'Backspace') ? '' : (event.code || event.key);
                            var newPref = {
                                ...state,
                                showAllShortcutKey: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showAllCtrl} onChange={handleCheckChange} name="showAllCtrl" />
                            }
                            label={window.i18n('ctrlKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showAllAlt} onChange={handleCheckChange} name="showAllAlt" />
                            }
                            label={window.i18n('altKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showAllShift} onChange={handleCheckChange} name="showAllShift" />
                            }
                            label={window.i18n('shiftKey')}
                        />
                    </FormControl>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showAllMeta} onChange={handleCheckChange} name="showAllMeta" />
                            }
                            label={window.i18n('metaKey')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('suggestType')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel>Source</InputLabel>
                        <Select
                            value={state.suggestType}
                            onChange={(event: SelectChangeEvent) => {
                                var newPref = {
                                    ...state,
                                    suggestType: event.target.value
                                };
                                setState(newPref);
                                window.searchData.prefConfig = newPref;
                                saveConfigToScript();
                            }}
                            autoWidth
                            label="Source"
                        >
                            <MenuItem value='google'>Google</MenuItem>
                            <MenuItem value='bing'>Bing</MenuItem>
                            <MenuItem value='baidu'>Baidu</MenuItem>
                            <MenuItem value='disable'>Disable</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('dragToSearch')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.dragToSearch} onChange={handleCheckChange} name="dragToSearch" />
                            }
                            label={window.i18n('dragToSearchTips')}
                        />
                    </FormControl>
                    <Box>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.dragCtrl} onChange={handleCheckChange} name="dragCtrl" />
                                }
                                label={window.i18n('ctrlKey')}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.dragAlt} onChange={handleCheckChange} name="dragAlt" />
                                }
                                label={window.i18n('altKey')}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.dragShift} onChange={handleCheckChange} name="dragShift" />
                                }
                                label={window.i18n('shiftKey')}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.dragMeta} onChange={handleCheckChange} name="dragMeta" />
                                }
                                label={window.i18n('metaKey')}
                            />
                        </FormControl>
                    </Box>
                </Box>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('hideDragHistory')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.hideDragHistory} onChange={handleCheckChange} name="hideDragHistory" />
                            }
                            label={window.i18n('hideDragHistoryTips')}
                        />
                    </FormControl>
                </Box>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('enableInPage')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.enableInPage} onChange={handleCheckChange} name="enableInPage" />
                            }
                            label={window.i18n('enableInPageTips')}
                        />
                    </FormControl>
                    <TextField
                        sx={{ minWidth: 100 }}
                        label={window.i18n('longPressTime')}
                        InputProps={{
                            inputMode: 'numeric', type:'number', pattern: '[0-9]*',
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.longPressTime}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = parseInt(event.target.value);
                            if (newValue < 0) {
                                newValue = 0;
                            }
                            var newPref = {
                                ...state,
                                longPressTime: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                </Box>
                <Box sx={state.enableInPage?{}:{ display: 'none' }}>
                    <Typography gutterBottom component="div">
                        <h4>{window.i18n('bindFunctionKey')}</h4>
                    </Typography>
                    <Box>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.ctrlKey} onChange={handleCheckChange} name="ctrlKey" />
                                }
                                label={window.i18n('ctrlKey')}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.altKey} onChange={handleCheckChange} name="altKey" />
                                }
                                label={window.i18n('altKey')}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.shiftKey} onChange={handleCheckChange} name="shiftKey" />
                                }
                                label={window.i18n('shiftKey')}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.metaKey} onChange={handleCheckChange} name="metaKey" />
                                }
                                label={window.i18n('metaKey')}
                            />
                        </FormControl>
                    </Box>
                    
                    <Typography gutterBottom component="div">
                        <h4>{window.i18n('enableRightMouse')}</h4>
                    </Typography>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.rightMouse} onChange={handleCheckChange} name="rightMouse" />
                            }
                            label={window.i18n('enableRightMouseTips')}
                        />
                    </FormControl>
                    <Typography gutterBottom component="div">
                        <h4>{window.i18n('enableLeftMouse')}</h4>
                    </Typography>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.leftMouse} onChange={handleCheckChange} name="leftMouse" />
                            }
                            label={window.i18n('enableLeftMouseTips')}
                        />
                    </FormControl>
                    <Typography gutterBottom component="div">
                        <h4>{window.i18n('selectToShow')}</h4>
                    </Typography>
                    <Box>
                        <FormControl sx={{ m: 1, minWidth: 80 }}>
                            <FormControlLabel
                                control={
                                    <Switch checked={state.selectToShow} onChange={handleCheckChange} name="selectToShow" />
                                }
                                label={window.i18n('selectToShowTips')}
                            />
                        </FormControl>
                    </Box>
                    <Typography gutterBottom component="div">
                        <h4>{window.i18n('limitPopupLen')}</h4>
                    </Typography>
                    <Box
                        sx={{ flexGrow: 1, display: 'flex', width: '100%', flexWrap: 'wrap' }}
                    >
                        <TextField
                            sx={{ width: 70, margin: '8px' }}
                            label={"Length"}
                            inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                            value={state.limitPopupLen}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                let newValue = parseInt(event.target.value);
                                if (newValue < 1) {
                                    newValue = 1;
                                }
                                if (newValue > 100) {
                                    newValue = 100;
                                }
                                var newPref = {
                                    ...state,
                                    limitPopupLen: newValue
                                };
                                setState(newPref);
                                window.searchData.prefConfig = newPref;
                                saveConfigToScript();
                            }}
                        />
                        <Typography gutterBottom component="div" sx={{ marginTop: '20px' }}>
                            {window.i18n('limitPopupLenTips')}
                        </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex'}}>
                        <Box>
                            <Typography gutterBottom component="div">
                                <h4>{window.i18n('minPopup')}</h4>
                            </Typography>
                            <Box sx={{ flexGrow: 1, display: 'flex'}}>
                                <FormControl sx={{ m: 1, minWidth: 80 }}>
                                    <InputLabel>Action</InputLabel>
                                    <Select
                                        value={state.minPopup}
                                        onChange={(event: SelectChangeEvent) => {
                                            var newPref = {
                                                ...state,
                                                minPopup: event.target.value
                                            };
                                            setState(newPref);
                                            window.searchData.prefConfig = newPref;
                                            saveConfigToScript();
                                        }}
                                        autoWidth
                                        label='Action'
                                    >
                                        <MenuItem value={0}>{window.i18n('minPopupDisable')}</MenuItem>
                                        <MenuItem value={1}>{window.i18n('minPopupEnable')}</MenuItem>
                                        <MenuItem value={2}>{window.i18n('minPopupInput')}</MenuItem>
                                    </Select>
                                </FormControl>
                                <Typography gutterBottom component="div" sx={{ marginTop: '20px' }}>
                                    {window.i18n('minPopupTips')}
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography gutterBottom component="div">
                                <h4>{window.i18n('hidePopup')}</h4>
                            </Typography>
                            <FormControl sx={{ m: 1, minWidth: 80, marginTop: '13px'}}>
                                <FormControlLabel
                                    control={
                                        <Switch checked={state.hidePopup} onChange={handleCheckChange} name="hidePopup" />
                                    }
                                    label={window.i18n('hidePopupTips')}
                                />
                            </FormControl>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
