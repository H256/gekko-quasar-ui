export const syncImports = ({commit}, resp) => {
    commit('syncImports', resp);
}

export const updateImport = ({commit}, data) => {
    commit('updateImport', data);
}

export const addImport = ({commit}, data) => {
    commit('addImport', data);
}