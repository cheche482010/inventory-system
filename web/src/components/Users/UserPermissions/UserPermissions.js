import { ref, computed, onMounted, toRefs } from 'vue';
import { userPermissionService } from '@/services/userPermissionService';
import { permissionService } from '@/services/permissionService';
import { useToast } from 'vue-toastification';

export default {
    name: 'UserPermissions',
    props: {
        userId: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const { userId } = toRefs(props);
        const toast = useToast();

        const allPermissions = ref([]);
        const assignedPermissions = ref([]);

        const availablePermissions = computed(() => {
            return allPermissions.value.filter(p => !assignedPermissions.value.some(ap => ap.id === p.id));
        });

        const loadPermissions = async () => {
            try {
                const [allRes, assignedRes] = await Promise.all([
                    permissionService.getAll(),
                    userPermissionService.getPermissions(userId.value),
                ]);
                allPermissions.value = allRes.data;
                assignedPermissions.value = assignedRes.data;
            } catch (error) {
                toast.error('Error al cargar los permisos');
            }
        };

        const assignPermission = async (permissionId) => {
            try {
                await userPermissionService.assignPermission(userId.value, permissionId);
                toast.success('Permiso asignado exitosamente');
                loadPermissions();
            } catch (error) {
                toast.error('Error al asignar el permiso');
            }
        };

        const revokePermission = async (permissionId) => {
            try {
                await userPermissionService.revokePermission(userId.value, permissionId);
                toast.success('Permiso revocado exitosamente');
                loadPermissions();
            } catch (error) {
                toast.error('Error al revocar el permiso');
            }
        };

        onMounted(loadPermissions);

        return {
            assignedPermissions,
            availablePermissions,
            assignPermission,
            revokePermission,
        };
    },
};
