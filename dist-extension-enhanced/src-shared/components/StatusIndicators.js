import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ProcessingIndicator = ({ isLocal, isProcessing }) => {
    if (!isProcessing)
        return null;
    const type = isLocal ? 'local' : 'cloud';
    const label = isLocal ? 'Processing Locally' : 'Using Cloud';
    const description = isLocal
        ? 'Your data stays on your device'
        : 'Processing with online AI service';
    return (_jsx("div", { className: `processing-indicator processing-indicator--${type}`, role: "status", "aria-live": "polite", "aria-label": `${label}. ${description}`, children: _jsx("span", { children: label }) }));
};
export const ReadingLevelIndicator = ({ level, isOptimal = false }) => {
    const className = isOptimal
        ? 'reading-level-indicator reading-level-indicator--grade-5'
        : 'reading-level-indicator';
    return (_jsxs("div", { className: className, role: "status", "aria-label": `Reading level: ${level}`, children: [_jsx("span", { children: "\uD83D\uDCD6" }), _jsx("span", { children: level }), isOptimal && _jsx("span", { children: "\u2713" })] }));
};
export const ProgressIndicator = ({ progress, label = 'Processing' }) => (_jsxs("div", { role: "progressbar", "aria-valuenow": progress, "aria-valuemin": 0, "aria-valuemax": 100, children: [label && (_jsxs("div", { className: "progress-label", style: { marginBottom: 'var(--space-xs)' }, children: [label, ": ", Math.round(progress), "%"] })), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-bar__fill", style: { width: `${progress}%` } }) })] }));
export const VocabularyHelp = ({ word, simpleDefinition, children }) => (_jsxs("span", { className: "vocabulary-help", role: "button", tabIndex: 0, "aria-label": `${word} means ${simpleDefinition}`, title: `${word}: ${simpleDefinition}`, children: [children, _jsx("span", { className: "vocabulary-help__tooltip", children: simpleDefinition })] }));
export const FloatingActionButton = ({ onClick, label, icon = "❓" }) => (_jsx("button", { className: "fab", onClick: onClick, "aria-label": label, title: label, children: _jsx("span", { style: { fontSize: '24px' }, role: "img", "aria-hidden": "true", children: icon }) }));
