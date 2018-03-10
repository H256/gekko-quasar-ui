import { restPath } from '../../tools/api'

const mixin = {
    methods: {
        startImport(config) {
            return this.$axios.post(restPath + 'import', config);
        }
    }
}

export default mixin;