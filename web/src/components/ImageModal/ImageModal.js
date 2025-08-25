export default {
    name: 'ImageModal',
    props: {
        imageUrl: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['close'],
    setup(props, { emit }) {
        const close = () => {
            emit('close');
        };

        return {
            close,
        };
    },
};