import {restPath} from '../../tools/api'

export default {
    methods: {
        getExchanges() {
            this.$axios.get(restPath + 'exchanges')
            .then((response)=>{
                if(response.text){
                    let resp = JSON.parse(response.text);
                    this.$store.commit('syncExchanges', resp)
                }
            })
            .catch(error => {
                console.error("API Error while retrieving Exchanges", error);
            })
        }
    }
}