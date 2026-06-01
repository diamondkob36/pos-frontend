/**
 * 🎨 Toast Notification System
 * ระบบแจ้งเตือนแบบ Modern Toast
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-500',
};

/**
 * แสดง Toast Notification
 */
export const toast = {
  show: ({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    // สร้าง Toast Element
    const toastEl = document.createElement('div');
    toastEl.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[9999] animate-slide-in-right max-w-md`;
    toastEl.innerHTML = `
      <span class="text-2xl">${icons[type]}</span>
      <span class="font-medium">${message}</span>
    `;

    // เพิ่ม Animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-in-right {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slide-out-right {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-out;
      }
      .animate-slide-out-right {
        animation: slide-out-right 0.3s ease-in;
      }
    `;
    if (!document.querySelector('#toast-styles')) {
      style.id = 'toast-styles';
      document.head.appendChild(style);
    }

    // เพิ่มเข้า DOM
    document.body.appendChild(toastEl);

    // ลบหลังครบเวลา
    setTimeout(() => {
      toastEl.classList.add('animate-slide-out-right');
      setTimeout(() => {
        document.body.removeChild(toastEl);
      }, 300);
    }, duration);
  },

  success: (message: string, duration?: number) => {
    toast.show({ message, type: 'success', duration });
  },

  error: (message: string, duration?: number) => {
    toast.show({ message, type: 'error', duration });
  },

  warning: (message: string, duration?: number) => {
    toast.show({ message, type: 'warning', duration });
  },

  info: (message: string, duration?: number) => {
    toast.show({ message, type: 'info', duration });
  },
};

/**
 * แสดง Confirm Dialog แบบ Modern
 */
export const confirm = (message: string, title = 'ยืนยันการทำงาน'): Promise<boolean> => {
  return new Promise((resolve) => {
    // สร้าง Overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-fade-in';

    // สร้าง Dialog
    const dialog = document.createElement('div');
    dialog.className = 'bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in';
    dialog.innerHTML = `
      <div class="text-center">
        <div class="text-5xl mb-4">❓</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex gap-3">
          <button id="cancel-btn" class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all">
            ยกเลิก
          </button>
          <button id="confirm-btn" class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
            ยืนยัน
          </button>
        </div>
      </div>
    `;

    // เพิ่ม Animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scale-in {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }
      .animate-scale-in {
        animation: scale-in 0.3s ease-out;
      }
    `;
    if (!document.querySelector('#confirm-styles')) {
      style.id = 'confirm-styles';
      document.head.appendChild(style);
    }

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Handle Buttons
    const confirmBtn = dialog.querySelector('#confirm-btn');
    const cancelBtn = dialog.querySelector('#cancel-btn');

    const cleanup = () => {
      document.body.removeChild(overlay);
    };

    confirmBtn?.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    cancelBtn?.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
  });
};
