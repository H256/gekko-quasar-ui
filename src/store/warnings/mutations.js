export const SET_GLOBAL_WARNING = (state, warning) => {
    state[warning.key] = warning.value;
    return state;
}
