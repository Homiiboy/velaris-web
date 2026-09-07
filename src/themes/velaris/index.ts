import { buildCustomColorScheme } from 'themes/utils';

/** The native Velaris color scheme. */
const theme = buildCustomColorScheme({
    palette: {
        background: {
            default: '#05060a',
            paper: '#0d1018'
        },
        primary: {
            main: '#45f3ff',
            dark: '#1687ff',
            light: '#9bfaff',
            contrastText: '#031014'
        },
        secondary: {
            main: '#d42cff',
            contrastText: '#ffffff'
        },
        text: {
            primary: '#f7fbff',
            secondary: 'rgba(226, 235, 247, 0.72)'
        },
        action: {
            focus: 'rgba(138, 54, 255, 0.22)',
            hover: 'rgba(69, 243, 255, 0.08)',
            selected: 'rgba(69, 243, 255, 0.14)'
        },
        divider: 'rgba(145, 170, 210, 0.18)',
        Alert: {
            infoFilledBg: '#1687ff',
            infoFilledColor: '#ffffff'
        },
        AppBar: {
            defaultBg: '#090c14'
        },
        Button: {
            inheritContainedBg: '#151a24',
            inheritContainedHoverBg: '#1d2635'
        },
        FilledInput: {
            bg: 'rgba(15, 19, 29, 0.92)',
            borderColor: 'rgba(145, 170, 210, 0.18)'
        },
        SnackbarContent: {
            bg: '#151a24',
            color: '#f7fbff'
        }
    }
});

export default theme;
