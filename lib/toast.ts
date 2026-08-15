/**
 * 🎨 Toast Notification System
 * ระบบแจ้งเตือนแบบ Modern Toast - ปรับให้เข้ากับธีมระบบ
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

const styles = {
  success: {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  },
  error: {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  },
  warning: {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  },
  info: {
    bg: 'bg-gray-800',
    border: 'border-gray-700',
  },
};

/**
 * แสดง Toast Notification
 */
export const toast = {
  show: ({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    // สร้าง Toast Element
    const toastEl = document.createElement('div');
    const style = styles[type];
    
    toastEl.className = `fixed top-4 right-4 ${style.bg} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[9999] animate-slide-in-right max-w-md border-2 ${style.border}`;
    toastEl.innerHTML = `
      <span class="text-3xl shrink-0">${icons[type]}</span>
      <span class="font-bold text-base leading-tight flex-1">${message}</span>
      <button class="ml-2 hover:bg-white/20 rounded-lg p-1 transition-colors shrink-0" onclick="this.parentElement.remove()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    // เพิ่ม Animation
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes slide-in-right {
        from {
          transform: translateX(120%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slide-out-right {
        from {
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateX(120%) scale(0.95);
          opacity: 0;
        }
      }
      .animate-slide-in-right {
        animation: slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .animate-slide-out-right {
        animation: slide-out-right 0.3s ease-in;
      }
    `;
    if (!document.querySelector('#toast-styles')) {
      styleEl.id = 'toast-styles';
      document.head.appendChild(styleEl);
    }

    // เพิ่มเข้า DOM
    document.body.appendChild(toastEl);

    // ลบหลังครบเวลา
    setTimeout(() => {
      toastEl.classList.add('animate-slide-out-right');
      setTimeout(() => {
        if (document.body.contains(toastEl)) {
          document.body.removeChild(toastEl);
        }
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
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center p-4 animate-fade-in';

    // สร้าง Dialog
    const dialog = document.createElement('div');
    dialog.className = 'bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in border border-gray-100';
    dialog.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-5">❓</div>
        <h3 class="text-2xl font-black text-gray-800 mb-3">${title}</h3>
        <p class="text-gray-600 mb-8 text-base leading-relaxed">${message}</p>
        <div class="flex gap-3">
          <button id="cancel-btn" class="flex-1 px-5 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-base">
            ยกเลิก
          </button>
          <button id="confirm-btn" class="flex-1 px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 text-base">
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
        animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
      overlay.classList.add('opacity-0');
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 200);
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
