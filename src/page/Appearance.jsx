import React from 'react';
import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';

const colorPresets = [
    {name: 'appearanceMinimal', light: ['#ffffff', 'transparent', '#334155', '#cbd5e1'], dark: ['#1e252e', 'transparent', '#e2e8f0', '#475569'],
        radius: '6px', tileRadius: '4px', shadow: 'none', tileShadow: 'none', blur: 'none', texture: 'none'},
    {name: 'appearanceGlass', light: ['#ffffff85', '#ffffff80', '#243447', '#ffffffb3'], dark: ['#20293480', '#ffffff12', '#e2e8f0', '#ffffff30'],
        radius: '20px', tileRadius: '12px', shadow: '0 8px 24px #20304026, inset 0 1px 0 #ffffff90',
        tileShadow: 'inset 0 0 0 1px #ffffff50', blur: 'blur(16px)', texture: 'linear-gradient(135deg, #ffffff50, transparent 65%)'},
    {name: 'appearanceOcean', light: ['#e5f2ff', '#f4f9ff', '#2059a0', '#91bce8'], dark: ['#162940', '#264664', '#dcecff', '#467ab0'],
        radius: '12px', tileRadius: '8px', shadow: '0 8px 20px #1a65ad38', tileShadow: '0 3px 0 var(--appearance-line)',
        blur: 'none', texture: 'linear-gradient(135deg, #4398ef30, #7d65dc28)'},
    {name: 'appearanceMint', light: ['#edf8f2', '#d6efe1', '#285745', '#a2ceb7'], dark: ['#1e3029', '#2c453b', '#d5eee0', '#426253'],
        radius: '28px', tileRadius: '50%', shadow: 'inset 0 0 0 2px var(--appearance-line)', tileShadow: 'none', blur: 'none', texture: 'none'},
    {name: 'appearanceSand', light: ['#faf5eb', '#f4e8d5', '#695039', '#ceba98'], dark: ['#342d25', '#493e32', '#f0e0cb', '#6b5843'],
        radius: '2px', tileRadius: '2px', shadow: '4px 4px 0 var(--appearance-line)', tileShadow: 'inset 0 0 0 1px var(--appearance-line)',
        blur: 'none', texture: 'none'}
];
const colorPresetCss = ({light, dark, radius, tileRadius, shadow, tileShadow, blur, texture}) => `#search-jumper {
  --appearance-surface: ${light[0]};
  --appearance-tile: ${light[1]};
  --appearance-ink: ${light[2]};
  --appearance-line: ${light[3]};
  --appearance-accent: ${light[2]};
  --appearance-shadow: ${shadow};
}
@media (prefers-color-scheme: dark) {
  #search-jumper {
    --appearance-surface: ${dark[0]};
    --appearance-tile: ${dark[1]};
    --appearance-ink: ${dark[2]};
    --appearance-line: ${dark[3]};
  }
}
#search-jumper > .search-jumper-searchBar {
  background: ${texture} var(--appearance-surface);
  border: 1px solid var(--appearance-line);
  border-radius: ${radius} !important;
  box-shadow: ${shadow};
  backdrop-filter: ${blur};
  opacity: 1;
}
#search-jumper.funcKeyCall > .search-jumper-searchBar {
  background: none;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
}
#search-jumper .search-jumper-type,
#search-jumper.funcKeyCall .search-jumper-type {
  background: ${texture} var(--appearance-surface) !important;
  border-radius: ${radius} !important;
  box-shadow: ${shadow} !important;
  backdrop-filter: ${blur};
}
#search-jumper.funcKeyCall > .search-jumper-searchBar > .search-jumper-type {
  padding: 8px !important;
  gap: 4px;
  border: 1px solid var(--appearance-line);
}
#search-jumper .search-jumper-btn,
#search-jumper.funcKeyCall .search-jumper-btn {
  background: var(--appearance-tile) !important;
  color: var(--appearance-ink) !important;
  border-radius: ${tileRadius} !important;
  box-shadow: ${tileShadow};
  filter: none;
  text-shadow: none;
}
#search-jumper span.search-jumper-word,
#search-jumper.funcKeyCall span.search-jumper-word {
  background: var(--appearance-accent) !important;
  color: white !important;
}
#search-jumper .search-jumper-btn > span,
#search-jumper.funcKeyCall a.search-jumper-btn:not(.search-jumper-word) > span {
  background: transparent !important;
  color: var(--appearance-ink) !important;
  text-shadow: none;
}
#search-jumper a.search-jumper-btn:hover {
  background: var(--appearance-line) !important;
}`;

const presetCssList = [
`.search-jumper-searchBarCon {
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
`.search-jumper-searchBarCon {
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
}`,
`.search-jumper-searchBar {
    border-radius: 3px !important;
}
.search-jumper-type, .search-jumper-logo {
    border-radius: 3px !important;
}
#search-jumper .search-jumper-btn {
    border-radius: 3px !important;
}
.searchJumperExpand>svg {
    background: black;
    border-radius: 3px;
}
.search-jumper-logoBtnSvg {
    background: white;
    border-radius: 3px;
}
#search-jumper.funcKeyCall .search-jumper-word {
    border-radius: 3px !important;
}`,
...colorPresets.map(colorPresetCss)
];

const previewDocument = `<!doctype html><html><head><meta charset="utf-8">
<style id="base-style"></style><style id="custom-style"></style>
<style>
body { margin: 0; min-height: 100vh; padding: 16px; box-sizing: border-box; display: grid; place-items: center; background-size: cover; background-position: center; }
#search-jumper { position: relative !important; inset: auto !important; display: block !important; width: max-content !important; height: auto !important; max-width: 100% !important; overflow: visible !important; }
#search-jumper>.search-jumper-searchBar { position: relative !important; inset: auto !important; visibility: visible !important; }
body:has(.search-jumper-left) { justify-items: start; }
#search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type,
#search-jumper.funcKeyCall>.search-jumper-searchBar>.search-jumper-type:hover { box-sizing: border-box; max-width: calc(100vw - 32px) !important; }
</style><link id="icon-style" rel="stylesheet"></head><body><div id="tiles"></div></body></html>`;

function AppearancePreview({preview, html, draft, title}) {
    const theme = useTheme();
    const [frameReady, setFrameReady] = React.useState(false);
    const frameRef = React.useRef(null);

    React.useEffect(() => {
        const doc = frameRef.current?.contentDocument;
        if (!frameReady || !preview || !doc) return;
        doc.getElementById('base-style').textContent = preview.cssText;
        doc.getElementById('tiles').innerHTML = html;
        const preventNavigation = event => event.preventDefault();
        doc.addEventListener('click', preventNavigation, true);
        return () => doc.removeEventListener('click', preventNavigation, true);
    }, [frameReady, preview, html]);

    React.useEffect(() => {
        const doc = frameRef.current?.contentDocument;
        if (!frameReady || !doc) return;
        // Keep draft CSS inside the preview and update it without reloading the frame.
        doc.getElementById('custom-style').textContent = draft.cssText;
        doc.documentElement.style.colorScheme = theme.palette.mode;
        const icons = doc.getElementById('icon-style');
        const updateIcons = event => {
            if (event && event.target.id !== 'search-jumper-font-awesome') return;
            const custom = draft.fontAwesomeCss.trim();
            const stylesheet = document.getElementById('search-jumper-font-awesome');
            const url = (custom && custom !== stylesheet?.dataset.configuredUrl ? custom : stylesheet?.href) || '';
            if (icons.getAttribute('href') !== url) {
                if (url) icons.setAttribute('href', url);
                else icons.removeAttribute('href');
            }
        };
        updateIcons();
        document.addEventListener('load', updateIcons, true);
        return () => document.removeEventListener('load', updateIcons, true);
    }, [draft, frameReady, theme.palette.mode]);

    return (
        <iframe ref={frameRef} title={title} sandbox="allow-same-origin"
            srcDoc={previewDocument} onLoad={() => setFrameReady(true)}
            style={{colorScheme: theme.palette.mode}} />
    );
}

export default function Appearance() {
    const [draft, setDraft] = React.useState(() => ({
        cssText: window.searchData.prefConfig.cssText || '',
        fontAwesomeCss: window.searchData.prefConfig.fontAwesomeCss || '',
        bgUrl: window.searchData.prefConfig.bgUrl || ''
    }));
    const [preset, setPreset] = React.useState('');
    const [preview, setPreview] = React.useState(null);
    const [previewError, setPreviewError] = React.useState(false);

    React.useEffect(() => {
        const timeout = setTimeout(() => setPreviewError(true), 10000);
        const receive = event => {
            if (event.source !== window || event.data?.command !== 'appearancePreview') return;
            if (event.data.error) {
                clearTimeout(timeout);
                setPreviewError(true);
            } else if (typeof event.data.cssText === 'string' && typeof event.data.html === 'string' && typeof event.data.sidebarHtml === 'string') {
                clearTimeout(timeout);
                setPreviewError(false);
                setPreview(event.data);
            }
        };
        window.addEventListener('message', receive);
        document.dispatchEvent(new Event('getAppearancePreview'));
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('message', receive);
        };
    }, []);

    const updateDraft = event => {
        const {name, value} = event.target;
        setDraft(previous => ({...previous, [name]: value}));
    };
    const changePreset = event => {
        setPreset(event.target.value);
        setDraft(previous => ({
            ...previous,
            cssText: event.target.value === '' ? '' : presetCssList[event.target.value]
        }));
    };
    const save = () => {
        Object.assign(window.searchData.prefConfig, draft);
        window.searchData.lastModified = Date.now();
        document.dispatchEvent(new CustomEvent('saveConfig', {
            detail: {searchData: window.searchData, notification: true}
        }));
    };

    return (
        <Box sx={{pb: 3}}>
            <Paper elevation={5}><h2>{window.i18n('customAppearance')}</h2></Paper>
            <Box className="appearance-layout">
                <Paper elevation={5} className="appearance-editor">
                    <FormControl fullWidth>
                        <InputLabel id="appearance-preset-label">{window.i18n('presetCss')}</InputLabel>
                        <Select labelId="appearance-preset-label" value={preset} label={window.i18n('presetCss')} onChange={changePreset}>
                            <MenuItem value="">{window.i18n('appearanceNone')}</MenuItem>
                            <MenuItem value={0}>{window.i18n('appearanceDefault')}</MenuItem>
                            <MenuItem value={1}>{window.i18n('appearanceLight')}</MenuItem>
                            <MenuItem value={2}>{window.i18n('appearanceSquare')}</MenuItem>
                            {colorPresets.map((item, index) =>
                                <MenuItem key={item.name} value={index + 3}>{window.i18n(item.name)}</MenuItem>)}
                        </Select>
                        <FormHelperText>{window.i18n('presetCssTips')}</FormHelperText>
                    </FormControl>
                    <TextField id="styleText" name="cssText" label={window.i18n('customCss')} multiline fullWidth
                        minRows={12} maxRows={24} value={draft.cssText} onChange={updateDraft}
                        className="appearance-css" spellCheck={false} />
                    <TextField id="fontAwesomeCss" name="fontAwesomeCss" label={window.i18n('fontAwesomeCss')} fullWidth
                        value={draft.fontAwesomeCss} onChange={updateDraft}
                        placeholder="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css" />
                    <TextField id="bgUrl" name="bgUrl" label={window.i18n('bgUrl')} fullWidth
                        value={draft.bgUrl} onChange={updateDraft} placeholder="https://example.com/background.jpg" />
                    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={save}>{window.i18n('save')}</Button>
                    </Box>
                </Paper>
                <Paper elevation={5} className="appearance-preview">
                    <Typography component="h3" variant="h6" sx={{fontWeight: 600}}>{window.i18n('appearancePreview')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1, mb: 2}}>
                        {window.i18n('appearancePreviewHint')}
                    </Typography>
                    <Box className="appearance-preview-stage"
                        style={{backgroundImage: draft.bgUrl ? 'url(' + JSON.stringify(draft.bgUrl) + ')' : undefined}}>
                        <AppearancePreview preview={preview} html={preview?.sidebarHtml} draft={draft} title={window.i18n('sidebarPreview')} />
                        <AppearancePreview preview={preview} html={preview?.html} draft={draft} title={window.i18n('tilePreview')} />
                    </Box>
                    {(!preview || previewError) &&
                        <Typography role="status" variant="body2" color={previewError ? 'error' : 'text.secondary'} sx={{mt: 2}}>
                            {window.i18n(previewError ? 'appearancePreviewUnavailable' : 'appearancePreviewLoading')}
                        </Typography>}
                </Paper>
            </Box>
        </Box>
    );
}
