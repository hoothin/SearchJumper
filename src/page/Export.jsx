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

function saveConfigToScript (notification) {
    var saveMessage = new Event('saveConfig');
    if (notification) saveMessage.notification = true;
    document.dispatchEvent(saveMessage);
}

const presetCssList = [
`     .search-jumper-searchBarCon {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         z-index: 2147483646;
         pointer-events: none;
         text-align: center;
         overflow: scroll;
         display: block;
         -ms-overflow-style: none;
         scrollbar-width: none;
     }
     .search-jumper-searchBar {
         overflow-wrap: break-word;
         background: #505050;
         border-radius: 20px!important;
         border: 1px solid #b3b3b3;
         display: inline-flex;
         pointer-events: all;
         margin-top: -25px;
         opacity: 0.3;
         vertical-align: top;
         transition:margin-top 0.25s ease, margin-left 0.25s, opacity 0.25s;
         user-select: none;
         box-sizing:content-box;
         text-align: center;
         position: relative;
     }
     .search-jumper-searchBarCon::-webkit-scrollbar {
         width: 0 !important;
         height: 0 !important;
     }
     .search-jumper-searchBarCon.search-jumper-scroll {
         pointer-events: all;
     }
     .search-jumper-scroll.search-jumper-bottom {
         overflow-y: hidden;
     }
     .search-jumper-scroll>.search-jumper-searchBar {
         position: static !important;
     }
     .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar {
         margin-left: 20px;
     }
     .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar:hover,
     .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar.initShow {
         margin-left: 0px;
     }
     .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar {
         margin-top: 0px;
     }
     .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar:hover,
     .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar.initShow {
         margin-top: 0px;
     }
     .search-jumper-searchBar:hover {
         margin-top: 0;
         opacity: 1;
     }
     .search-jumper-searchBar.initShow {
         margin-top: 0;
         opacity: 0.8;
     }
     .search-jumper-left,
     .search-jumper-left .search-jumper-type,
     .search-jumper-left>.search-jumper-searchBar,
     .search-jumper-right,
     .search-jumper-right .search-jumper-type,
     .search-jumper-right>.search-jumper-searchBar {
         flex-direction: column;
         max-width: 42px;
     }
     .search-jumper-left {
         height: 100%;
         text-align: initial;
     }
     .search-jumper-right {
         left: unset;
         right: 0;
         height: 100%;
     }
     .search-jumper-bottom {
         top: unset;
         bottom: 0;
         height: 38px;
     }
     .search-jumper-left>.search-jumper-searchBar {
         margin-top: 0;
         margin-left: -20px;
     }
     .search-jumper-right>.search-jumper-searchBar {
         margin-top: 0;
         margin-left: 0px;
         position: fixed;
     }
     .search-jumper-left>.search-jumper-searchBar:hover,
     .search-jumper-left>.search-jumper-searchBar.initShow {
         margin-top: unset;
         margin-left: 0;
     }
     .search-jumper-right>.search-jumper-searchBar:hover,
     .search-jumper-right>.search-jumper-searchBar.initShow {
         margin-top: unset;
         margin-left: -20px;
     }
     .search-jumper-bottom>.search-jumper-searchBar {
         position: relative;
         margin-top: 0px;
         transition: transform 0.25s;
         -webkit-transform:scale(.9);
         -moz-transform:scale(.9);
         transform:scale(.9);
     }
     .search-jumper-bottom>.search-jumper-searchBar:hover,
     .search-jumper-bottom>.search-jumper-searchBar.initShow {
         margin-top: 0px;
         -webkit-transform:scale(1);
         -moz-transform:scale(1);
         transform:scale(1);
     }
     .search-jumper-btn {
         position: relative;
         display: grid;
         padding: 1px;
         margin: 3px;
         cursor: pointer;
         transition:margin-left 0.25s ease, width 0.25s, height 0.25s, transform 0.25s;
         width: 32px;
         height: 32px;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
         text-decoration:none;
         min-width: 32px;
         min-height: 32px;
     }
     .search-jumper-btn>i {
         line-height: 32px;
     }
     .search-jumper-logoBtnSvg {
         width: 32px;
         height: 32px;
         overflow: hidden;
         vertical-align: top;
         cursor: grab;
     }
     .search-jumper-type.search-jumper-needInPage,
     .search-jumper-type.search-jumper-targetImg {
         display: none;
     }
     .search-jumper-isInPage>.search-jumper-type.search-jumper-needInPage,
     .search-jumper-isTargetImg>.search-jumper-type.search-jumper-targetImg {
         display: inline-flex;
     }
     .search-jumper-type {
         display: inline-flex;
         background: #c5c5c5;
         border-radius: 20px!important;
         overflow: hidden;
         transition:width 0.25s ease, height 0.25s;
     }
     .search-jumper-searchBar.disable-pointer>.search-jumper-type {
         pointer-events: none;
     }
     .search-jumper-word {
         background: black;
         color: white!important;
         border-radius: 20px!important;
         font-size: 16px;
         line-height: 32px;
         width: 32px;
         height: 32px;
         min-width: 32px;
         min-height: 32px;
     }
     .search-jumper-type img {
         width: 32px;
         height: 32px;
     }
     .search-jumper-tips {
         pointer-events: none;
         position: fixed;
         font-size: xx-large;
         background: #f5f5f5e0;
         border-radius: 10px!important;
         padding: 5px;
         box-shadow: 0px 0px 10px 0px #000;
         font-weight: bold;
         transition: all 0.2s ease;
         color: black;
         white-space: nowrap;
     }
     .search-jumper-type.search-jumper-hide {
         background: unset;
     }
     .search-jumper-searchBar .search-jumper-btn:hover {
         -webkit-transform:scale(1.2);
         -moz-transform:scale(1.2);
         transform:scale(1.2);
         color: white;
         text-decoration:none;
     }`,
`     .search-jumper-searchBarCon {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         z-index: 2147483646;
         pointer-events: none;
         text-align: center;
         overflow: scroll;
         display: block;
         -ms-overflow-style: none;
         scrollbar-width: none;
     }
     .search-jumper-searchBar {
         overflow-wrap: break-word;
         background: #AFAFAF;
         border-radius: 20px!important;
         border: 1px solid #c9c9c9;
         display: inline-flex;
         pointer-events: all;
         margin-top: -25px;
         opacity: 0.3;
         vertical-align: top;
         transition:margin-top 0.25s ease, margin-left 0.25s, opacity 0.25s;
         user-select: none;
         box-sizing:content-box;
         text-align: center;
         position: relative;
     }
     .search-jumper-searchBarCon::-webkit-scrollbar {
         width: 0 !important;
         height: 0 !important;
     }
     .search-jumper-searchBarCon.search-jumper-scroll {
         pointer-events: all;
     }
     .search-jumper-scroll.search-jumper-bottom {
         overflow-y: hidden;
     }
     .search-jumper-scroll>.search-jumper-searchBar {
         position: static !important;
     }
     .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar {
         margin-left: 20px;
     }
     .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar:hover,
     .search-jumper-scroll.search-jumper-right>.search-jumper-searchBar.initShow {
         margin-left: 0px;
     }
     .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar {
         margin-top: 0px;
     }
     .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar:hover,
     .search-jumper-scroll.search-jumper-bottom>.search-jumper-searchBar.initShow {
         margin-top: 0px;
     }
     .search-jumper-searchBar:hover {
         margin-top: 0;
         opacity: 1;
     }
     .search-jumper-searchBar.initShow {
         margin-top: 0;
         opacity: 0.8;
     }
     .search-jumper-left,
     .search-jumper-left .search-jumper-type,
     .search-jumper-left>.search-jumper-searchBar,
     .search-jumper-right,
     .search-jumper-right .search-jumper-type,
     .search-jumper-right>.search-jumper-searchBar {
         flex-direction: column;
         max-width: 42px;
     }
     .search-jumper-left {
         height: 100%;
         text-align: initial;
     }
     .search-jumper-right {
         left: unset;
         right: 0;
         height: 100%;
     }
     .search-jumper-bottom {
         top: unset;
         bottom: 0;
         height: 38px;
     }
     .search-jumper-left>.search-jumper-searchBar {
         margin-top: 0;
         margin-left: -20px;
     }
     .search-jumper-right>.search-jumper-searchBar {
         margin-top: 0;
         margin-left: 0px;
         position: fixed;
     }
     .search-jumper-left>.search-jumper-searchBar:hover,
     .search-jumper-left>.search-jumper-searchBar.initShow {
         margin-top: unset;
         margin-left: 0;
     }
     .search-jumper-right>.search-jumper-searchBar:hover,
     .search-jumper-right>.search-jumper-searchBar.initShow {
         margin-top: unset;
         margin-left: -20px;
     }
     .search-jumper-bottom>.search-jumper-searchBar {
         position: relative;
         margin-top: 0px;
         transition: transform 0.25s;
         -webkit-transform:scale(.9);
         -moz-transform:scale(.9);
         transform:scale(.9);
     }
     .search-jumper-bottom>.search-jumper-searchBar:hover,
     .search-jumper-bottom>.search-jumper-searchBar.initShow {
         margin-top: 0px;
         -webkit-transform:scale(1);
         -moz-transform:scale(1);
         transform:scale(1);
     }
     .search-jumper-btn {
         position: relative;
         display: grid;
         padding: 1px;
         margin: 3px;
         cursor: pointer;
         transition:margin-left 0.25s ease, width 0.25s, height 0.25s, transform 0.25s;
         width: 32px;
         height: 32px;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
         text-decoration:none;
         min-width: 32px;
         min-height: 32px;
     }
     .search-jumper-btn>i {
         line-height: 32px;
     }
     .search-jumper-logoBtnSvg {
         width: 32px;
         height: 32px;
         overflow: hidden;
         vertical-align: top;
         cursor: grab;
     }
     .search-jumper-type.search-jumper-needInPage,
     .search-jumper-type.search-jumper-targetImg {
         display: none;
     }
     .search-jumper-isInPage>.search-jumper-type.search-jumper-needInPage,
     .search-jumper-isTargetImg>.search-jumper-type.search-jumper-targetImg {
         display: inline-flex;
     }
     .search-jumper-type {
         display: inline-flex;
         background: #efefef;
         border-radius: 20px!important;
         overflow: hidden;
         transition:width 0.25s ease, height 0.25s;
     }
     .search-jumper-searchBar.disable-pointer>.search-jumper-type {
         pointer-events: none;
     }
     .search-jumper-word {
         background: white;
         color: black!important;
         border-radius: 20px!important;
         font-size: 16px;
         line-height: 32px;
         width: 32px;
         height: 32px;
         min-width: 32px;
         min-height: 32px;
     }
     .search-jumper-type img {
         width: 32px;
         height: 32px;
     }
     .search-jumper-tips {
         pointer-events: none;
         position: fixed;
         font-size: xx-large;
         background: #0A0A0Ae0;
         border-radius: 10px!important;
         padding: 5px;
         box-shadow: 0px 0px 10px 0px #FFFFFF;
         font-weight: bold;
         transition: all 0.2s ease;
         color: white;
         white-space: nowrap;
     }
     .search-jumper-type.search-jumper-hide {
         background: unset;
     }
     .search-jumper-searchBar .search-jumper-btn:hover {
         -webkit-transform:scale(1.2);
         -moz-transform:scale(1.2);
         transform:scale(1.2);
         color: black;
         text-decoration:none;
     }`
];

export default function Export() {
    const [presetCss, setPresetCss] = React.useState('');
    const [cssText, setCssText] = React.useState(window.searchData.prefConfig.cssText);
    const [fontAwesomeCss, setFontAwesomeCss] = React.useState(window.searchData.prefConfig.fontAwesomeCss);
    const sitesData = JSON.stringify(window.searchData.sitesConfig, null, 4);

    var sitesDataInput;
    function saveConfig() {
        try {
            window.searchData.sitesConfig = JSON.parse(sitesDataInput.value);
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


    const handleChange = (event: SelectChangeEvent) => {
        setPresetCss(event.target.value);
        if (event.target.value === '') return;
        if (!cssText || window.confirm(window.i18n('replaceCss'))) {
            setCssText(presetCssList[event.target.value]);
        }
    };
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
            <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="select-helper-label">{window.i18n('presetCss')}</InputLabel>
                <Select
                    labelId="select-helper-label"
                    id="select-helper"
                    value={presetCss}
                    label="Css"
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
                rows={25}
                value={cssText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCssText(event.target.value);
                }}
            />
            <TextField
                id="fontAwesomeCss"
                label={window.i18n('fontAwesomeCss')}
                fullWidth
                sx={{mb : 5}}
                rows={25}
                value={fontAwesomeCss}
                placeholder="https://cdn.bootcdn.net/ajax/libs/font-awesome/6.1.1/css/all.min.css"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setFontAwesomeCss(event.target.value);
                }}
            />
            <SpeedDial
                ariaLabel="SpeedDial"
                sx={{ position: 'fixed', bottom: '20%', right: 16 }}
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