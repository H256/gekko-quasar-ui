export const setGlobalWarning = async ({commit}, obj) => {
  return new Promise((resolve, reject)=> {
    commit('SET_GLOBAL_WARNING', obj);
    resolve();
  })

}
