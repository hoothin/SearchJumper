import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';

function saveConfigToScript (notification) {
    var saveMessage = new Event('saveConfig');
    if (notification) saveMessage.notification = true;
    document.dispatchEvent(saveMessage);
}

export default function Export() {
    const sitesData = JSON.stringify(window.searchData.sitesConfig, null, 4);

    var sitesDataInput;
    function saveConfig() {
        window.searchData.sitesConfig = JSON.parse(sitesDataInput.value);
        saveConfigToScript(true);
    }

    function copyConfig() {
        var copyMessage = new Event('copyConfig');
        document.dispatchEvent(copyMessage);
    }

    return (
        <Box>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('exportConfig')}</h2>
            </Paper>
            <TextField
                id="outlined-multiline-static"
                label={window.i18n('configContent')}
                multiline
                fullWidth
                rows={25}
                defaultValue={sitesData}
                inputRef={input => sitesDataInput = input}
            />
            <SpeedDial
                ariaLabel="SpeedDial"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    key='Copy'
                    icon=<FileCopyIcon />
                    tooltipTitle={window.i18n('copy')}
                    onClick = {copyConfig}
                />
                <SpeedDialAction
                    key='Save'
                    icon=<SaveIcon />
                    tooltipTitle={window.i18n('save')}
                    onClick = {saveConfig}
                />
            </SpeedDial>
        </Box>
    );
}