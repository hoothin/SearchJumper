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
            newPref.position.y = 'top';
        }
        setState(newPref);
        window.searchData.prefConfig = newPref;
        saveConfigToScript();
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
                    <h4>{window.i18n('toolbarPosition')}</h4>
                </Typography>
                <Box
                  sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', maxWidth: '100%', flexWrap: 'wrap' }}
                >
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <InputLabel id="demo-simple-select-autowidth-label">{window.i18n('horizontal')}</InputLabel>
                        <Select
                          labelId="demo-simple-select-autowidth-label"
                          id="demo-simple-select-autowidth"
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
                        <InputLabel id="demo-simple-select-autowidth-label">{window.i18n('portrait')}</InputLabel>
                        <Select
                          labelId="demo-simple-select-autowidth-label"
                          id="demo-simple-select-autowidth"
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
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.initShow} onChange={handleCheckChange} name="initShow" />
                            }
                            label={window.i18n('initShow')}
                            labelPlacement="top"
                        />
                    </FormControl>
                    <TextField
                        sx={{ m: 1, minWidth: 100 }}
                        label={window.i18n('customSize')}
                        inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }}
                        value={state.customSize}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = event.target.value;
                            if (newValue > 1000) {
                                newValue = 1000;
                            } else if (newValue < 1) {
                                newValue = 1;
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
                    <TextField
                        sx={{ m: 1, minWidth: 100 }}
                        label={window.i18n('typeOpenTime')}
                        inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.typeOpenTime}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = event.target.value;
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
                        inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.autoDelay}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            var newPref = {
                                ...state,
                                autoDelay: event.target.value
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
                        inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ms</InputAdornment>
                        }}
                        value={state.longPressTime}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = event.target.value;
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
                </Box>
            </Paper>
        </Box>
    );
}
