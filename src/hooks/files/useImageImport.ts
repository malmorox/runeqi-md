import { saveImages } from '@helpers/images';
import { useAlerts } from '@hooks/useAlerts';
import { listRejections, storageErrorMessage } from '@utils/alertMessages';

// Saves images into the Images folder and reports the rejected ones with an alert.
// Successes are only reported with `notifySuccess`: where the image shows up right away
// (e.g. pasted into the editor) an alert would just get in the way
export function useImageImport({ notifySuccess = false } = {}) {
    const alerts = useAlerts();

    const importImages = async (files: File[], options?: { pasted?: boolean }) => {
        if (files.length === 0) return [];
        try {
            const { saved, errors } = await saveImages(files, options);
            const total = saved.length + errors.length;

            if (errors.length === 0) {
                if (notifySuccess) {
                    alerts.success({
                        title: saved.length === 1 ? 'Image added' : `${saved.length} images added`,
                        message: saved.length === 1
                            ? `"${saved[0].name}" was saved in the Images folder.`
                            : 'They were saved in the Images folder.',
                    });
                }
            } else if (saved.length > 0) {
                alerts.warning({ title: `${saved.length} of ${total} images added`, message: listRejections(errors) });
            } else {
                alerts.error({
                    title: total === 1 ? "The image couldn't be added" : "The images couldn't be added",
                    message: listRejections(errors),
                });
            }
            return saved;
        } catch (error) {
            alerts.error({ title: "The images couldn't be saved", message: storageErrorMessage(error) });
            return [];
        }
    };

    return { importImages };
}
