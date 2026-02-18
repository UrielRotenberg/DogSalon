import { toast } from 'react-toastify';

const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
    rtl: true,
};

export const notify = {
    success: (msg) => toast.success(msg, toastOptions),
    error: (msg) => toast.error(msg, toastOptions),
    info: (msg) => toast.info(msg, toastOptions),
    warn: (msg) => toast.warn(msg, toastOptions),
};