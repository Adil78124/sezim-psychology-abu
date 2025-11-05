// Утилита для анимации появления элементов при прокрутке
export const initScrollAnimations = () => {
  // Проверяем, что мы в браузере
  if (typeof window === 'undefined') return null;
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);

  // Находим все элементы с классом animate-on-scroll
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach(el => observer.observe(el));

  return observer;
};

// Функция для добавления анимации к элементам
export const addScrollAnimation = (element) => {
  if (element) {
    element.classList.add('animate-on-scroll');
  }
};

// Функция для создания эффекта печатания
export const typewriterEffect = (element, text, speed = 100) => {
  if (!element) return;
  
  element.textContent = '';
  let i = 0;
  
  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
  
  return timer;
};

// Функция для создания пульсирующего эффекта
export const addPulseEffect = (element) => {
  if (!element) return;
  
  element.style.animation = 'pulse 2s infinite';
  
  // Добавляем CSS для пульсации если его нет
  if (!document.querySelector('#pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Функция для создания эффекта "волны" при клике
export const addRippleEffect = (element) => {
  if (!element) return;
  
  element.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
  
  // Добавляем CSS для эффекта волны если его нет
  if (!document.querySelector('#ripple-animation')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};
