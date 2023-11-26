import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';


function saveConfigToScript (notification) {
    var saveMessage = new CustomEvent('saveConfig', {
        detail: {
            searchData: window.searchData, 
            notification: !!notification
        }
    });
    document.dispatchEvent(saveMessage);
}

function getFormatRule() {
    let inPageRule = window.searchData.prefConfig.inPageRule || {};
    let keys = Object.keys(inPageRule);
    if (!keys || keys.length === 0) {
        return "";
    }
    let formarObj = {};
    keys.forEach(key => {
        let value = inPageRule[key];
        if (!value) return;
        if (key.indexOf("@") === 0) {
            formarObj[key] = value;
            return;
        }
        let splitSep = null;
        if (value.indexOf("$c") === 0 && value.length > 2) {
            splitSep = value.substr(2, 1);
            value = value.substr(3).trim();
        } else if (value.indexOf("$o") === 0) {
            value = value.substr(2).trim();
        } else splitSep = " ";
        formarObj[key] = {};
        if (splitSep !== null && splitSep !== " ") formarObj[key]["sep"] = splitSep;
        formarObj[key]["words"] = value.split(splitSep);
    });
    return JSON.stringify(formarObj, null, 4);
}

function setInPageRule() {
    let inPageRuleInput = document.querySelector("#inPageRule");
    let inPageWordsStyles = document.querySelector("#inPageWordsStyles");
    let colors = document.querySelectorAll("#colors>[type='color']");
    if (!inPageRuleInput.value) {
        window.searchData.prefConfig.inPageRule = {};
    } else {
        let ruleObj;
        try {
            ruleObj = JSON.parse(inPageRuleInput.value);
        } catch (e) {
            alert(e);
            return;
        }
        inPageRuleInput.value = JSON.stringify(ruleObj, null, 4);
        let storeObj = {};
        let keys = Object.keys(ruleObj);
        if (!keys || keys.length === 0) {
            return;
        }
        keys.forEach(key => {
            let value = ruleObj[key];
            if (!value) return;
            if (key.indexOf("@") === 0) {
                storeObj[key] = value;
                return;
            }
            if (!value.words || value.words.length === 0) return;
            let pre = "", sep = value.sep || "";
            if (sep) {
                pre = "$c" + sep;
            } else {
                sep = " ";
                if (value.words.length === 1) {
                    let onlyWord = value.words[0];
                    if (onlyWord.indexOf(" ") !== -1) {
                        sep = "";
                        pre = "$o";
                    }
                }
            }
            storeObj[key] = pre + value.words.join(sep);
        });
        window.searchData.prefConfig.inPageRule = storeObj;
    }
    if (!inPageWordsStyles.value) {
        window.searchData.prefConfig.inPageWordsStyles = [];
    } else {
        let styleArr;
        try {
            styleArr = JSON.parse(inPageWordsStyles.value);
        } catch (e) {
            alert(e);
            return;
        }
        window.searchData.prefConfig.inPageWordsStyles = styleArr;
    }
    [].forEach.call(colors, (color, i) => {
        if (color.value) window.searchData.prefConfig.firstFiveWordsColor[i] = color.value;
    });
    if (window.searchData.prefConfig.inPageRule) {
        window.searchData.lastModified = new Date().getTime();
        window.saveToWebdav();
    }
    saveConfigToScript(true);
}

function addInPageGroup() {
    let groupName = window.prompt(window.i18n("presetGroupName"), "groupName");
    if (!groupName) return;
    let groupValue = window.prompt(window.i18n("presetGroupValue"), "jack|rose");
    if (!window.searchData.prefConfig.inPageRule) {
        window.searchData.prefConfig.inPageRule = {};
    }
    window.searchData.prefConfig.inPageRule["@" + groupName] = groupValue;
    document.querySelector("#inPageRule").value = getFormatRule();
}
var downloadEle = document.createElement('a');
    downloadEle.download = "searchJumperHighlight.json";
    downloadEle.target = "_blank";
function exportInPageRule() {
    let blobStr = [JSON.stringify(window.searchData.prefConfig.inPageRule || {}, null, 4)];
    let myBlob = new Blob(blobStr, { type: "application/json" });
    downloadEle.href = window.URL.createObjectURL(myBlob);
    downloadEle.click();
}
function importInPageRule(event) {
    let reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = function() {
        let jsonData = JSON.parse(this.result);
        window.searchData.prefConfig.inPageRule = jsonData;
        document.querySelector("#inPageRule").value = getFormatRule();
    };
}
var ignoreWordsTimer;
const ruleTips = `{
    "@wordsTemplate1": "/sunshine|boringMan|adam smasher/i",   //template of some user name of boring man, ignore case
    "@wordsTemplate2": "/24712|74812|312456/l",                             //template of some user id of boring man, effect on link
    "https://www.g??gle.com": {  //site url
        sep: "|",                                //separator for words, set when your keyword has space inside
        words: [                                //words to find
            "word1$t{wow}",             //find word1 and add tips "wow"
            "word2$s{red;}"               //find word2 and change background to red
        ]
    },
    "*bing.com": {
        words: [
            "@wordsTemplate1$p{0}"                        //find words with wordsTemplate1 and hide first parentNode of target
        ]
    },
    "/.*youtube\\\\.com/i": {           //RegExp of site url, ignore case sensitivity
        words: [
            "/tv\\\\d+/$t{$popup}"      //find word like tv01,tv02 and popup panel while mouse over
        ]
    }
}`;
const ruleTitle = `{
    "@wordsTemplate1": "/sunshine|boringMan|adam smasher/i",   //template of some user name of boring man, ignore case
    "@wordsTemplate2": "/24712|74812|312456/l",                           //template of some user id of boring man, effect on link
    "https://www.g??gle.com": {   //site url
        sep: "@",                               //separator for words, set when your keyword has space inside
        words: [                               //words to find
            "word1$t{wow}",             //find word1 and add tips "wow"
            "word2$s{red;}"               //find word2 and change background to red
        ]
    },
    "*bing.com": {
        words: [
            "@wordsTemplate1$p{0}"                        //find words with wordsTemplate1 and hide first parentNode of target
        ]
    },
    "/.*youtube\\\\.com/i": {            //RegExp of site url, ignore case sensitivity
        words: [
            "/tv\\\\d+/$t{$popup}"      //find word like tv01,tv02 and popup panel while mouse over
        ]
    }
}`;
export default function FindInPage() {
    if (!window.searchData.prefConfig.showInSearchEngine) {
        window.searchData.prefConfig.showInSearchEngine = false;
    }
    if (!window.searchData.prefConfig.showInSearchJumpPage) {
        window.searchData.prefConfig.showInSearchJumpPage = false;
    }
    if (!window.searchData.prefConfig.limitInPageLen) {
        window.searchData.prefConfig.limitInPageLen = 1;
    }
    if (!window.searchData.prefConfig.ignoreWords) {
        window.searchData.prefConfig.ignoreWords = ["a", "in", "into", "the", "to", "on", "among", "between", "and", "an", "of", "by", "with", "about", "under"];
    }
    if (!window.searchData.prefConfig.inPageRule) {
        window.searchData.prefConfig.inPageRule = {};
    }
    if (!window.searchData.prefConfig.firstFiveWordsColor || window.searchData.prefConfig.firstFiveWordsColor.length < 1) {
        window.searchData.prefConfig.firstFiveWordsColor = ["#ffff00", "#e91e63", "#00bcd4", "#008000", "#800080"];
    }
    if (!window.searchData.prefConfig.inPageWordsStyles) {
        window.searchData.prefConfig.inPageWordsStyles = [];
    }
    if (!window.searchData.prefConfig.globalSearchNow) {
        window.searchData.prefConfig.globalSearchNow = false;
    }
    if (!window.searchData.prefConfig.altToHighlight) {
        window.searchData.prefConfig.altToHighlight = false;
    }
    if (!window.searchData.prefConfig.emptyAfterCloseInput) {
        window.searchData.prefConfig.emptyAfterCloseInput = false;
    }
    const [state, setState] = React.useState(
        window.searchData.prefConfig
    );
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
        <Box sx={{pb : 5}}>
            <Paper elevation={5} sx={{textAlign:'center', borderRadius:'10px'}}>
                <h2 style={{padding:'5px'}}>{window.i18n('findInPage')}</h2>
            </Paper>
            <Paper elevation={5} sx={{ padding: '20px', marginTop: '20px' }}>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('showInSearchEngine')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showInSearchEngine} onChange={handleCheckChange} name="showInSearchEngine" />
                            }
                            label={window.i18n('showInSearchEngineTips')}
                        />
                    </FormControl>
                </Box>

                <Typography gutterBottom component="div">
                    <h4>{window.i18n('showInSearchJumpPage')}</h4>
                </Typography>
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 80 }}>
                        <FormControlLabel
                            control={
                                <Switch checked={state.showInSearchJumpPage} onChange={handleCheckChange} name="showInSearchJumpPage" />
                            }
                            label={window.i18n('showInSearchJumpPageTips')}
                        />
                    </FormControl>
                </Box>

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
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('emptyAfterCloseInput')}</h4>
                </Typography>
                <FormControl sx={{ m: 1, minWidth: 80 }}>
                    <FormControlLabel
                        control={
                            <Switch checked={state.emptyAfterCloseInput} onChange={handleCheckChange} name="emptyAfterCloseInput" />
                        }
                        label={window.i18n('emptyAfterCloseInputTips')}
                    />
                </FormControl>

                <Typography gutterBottom component="div">
                    <h4>{window.i18n('limitInPageLen')}</h4>
                </Typography>
                <Box
                    sx={{ flexGrow: 1, display: 'flex', width: '100%', flexWrap: 'wrap' }}
                >
                    <TextField
                        sx={{ width: 70, margin: '8px' }}
                        label={"Number"}
                        inputProps={{ inputMode: 'numeric', type:'number', pattern: '[0-9]*' }}
                        value={state.limitInPageLen}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            let newValue = parseInt(event.target.value);
                            if (newValue < 1) {
                                newValue = 1;
                            }
                            var newPref = {
                                ...state,
                                limitInPageLen: newValue
                            };
                            setState(newPref);
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }}
                    />
                    <Typography gutterBottom component="div" sx={{ marginTop: '20px' }}>
                        {window.i18n('limitInPageLenTips')}
                    </Typography>
                </Box>

                <Typography gutterBottom component="div">
                    <h4>{window.i18n('ignoreWords')}</h4>
                </Typography>
                <TextField
                    id="ignoreWords"
                    fullWidth
                    sx={{mb : 1}}
                    value={state.ignoreWords.join(",")}
                    placeholder="a, in, into, the, to, on, among, between, and, an, of, by, with, about, under"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        let newValue = event.target.value.trim().replace(/\s*,\s*/g, ",").split(",");
                        var newPref = {
                            ...state,
                            ignoreWords: newValue
                        };
                        setState(newPref);
                        if (ignoreWordsTimer) clearTimeout(ignoreWordsTimer);
                        ignoreWordsTimer = setTimeout(() => {
                            window.searchData.prefConfig = newPref;
                            saveConfigToScript();
                        }, 500);
                    }}
                />
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('inPageWordsStyles')}</h4>
                </Typography>
                <Box id="colors" sx={{display: "flex", alignItems: "center"}}>
                    {state.firstFiveWordsColor.map((color, i) => (
                        <input key={i} style={{margin: "10px"}} type="color" defaultValue={color} index={i} title={"Color " + (i + 1)}/>
                    ))}
                    <TextField
                        sx={{ m: 1, minWidth: 100 }}
                        id="inPageWordsStyles"
                        fullWidth
                        placeholder={`["background: red", "border-radius: 5px"]`}
                        label={window.i18n('inPageWordsAddStyles')}
                        defaultValue={
                            (state.inPageWordsStyles && state.inPageWordsStyles.length > 0) ?
                            JSON.stringify(state.inPageWordsStyles) :
                            ""
                        }
                    />
                </Box>
                <Typography gutterBottom component="div">
                    <h4>{window.i18n('inPageRule')}</h4>
                </Typography>
                <TextField
                    id="inPageRule"
                    fullWidth
                    sx={{mb : 1}}
                    defaultValue={getFormatRule()}
                    multiline
                    rows={10}
                    title={ruleTitle}
                    placeholder={ruleTips}
                />
                <Box sx={{display: 'flex', mb: 1}}>
                    <Button fullWidth variant="outlined" color="primary" onClick={addInPageGroup} title={window.i18n('addGroupTips')}>{window.i18n('addGroup')}</Button>
                    <Button fullWidth variant="outlined" color="primary" onClick={exportInPageRule}>{window.i18n('exportConfig')}</Button>
                    <Button fullWidth variant="outlined" color="primary" component="label">{window.i18n('import')}
                        <input type="file" accept=".txt, .json" hidden onChange={importInPageRule}/>
                    </Button>
                </Box>
                <Button fullWidth variant="outlined" color="primary" onClick={setInPageRule}>{window.i18n('save')}</Button>
            </Paper>
        </Box>
    );
}