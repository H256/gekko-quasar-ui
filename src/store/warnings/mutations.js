export const setGlobalWarning = (state, warning) => {
    state.warnings[warning.key] = warning.value;
    return state;
}