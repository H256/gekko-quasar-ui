import { restPath } from '../../tools/api'

export default {
    methods: {
        deleteApiKey(exchange) {
            //console.log("remove apikey?")
            return this.$axios.post(restPath + 'removeApiKey', { exchange });
        },
        newApiKey(credentials) {
            return this.$axios.post(restPath + 'addApiKey', credentials);
        }
    }
}