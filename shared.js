// @ts-check
document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const menu = document.querySelector('.nav-links');
const menuToggle = document.querySelector('.menu-toggle');
if (menu && menuToggle) {
  const closeMenu = () => {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu +';
  };
  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Đóng −' : 'Menu +';
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      if (menuToggle instanceof HTMLElement) menuToggle.focus();
    }
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);
}

const dialog = document.createElement('dialog');
dialog.className = 'modal';
dialog.setAttribute('aria-labelledby', 'inquiry-title');
dialog.innerHTML = `
  <button class="modal-close" type="button" aria-label="Đóng hộp thoại">×</button>
  <span class="eyebrow">Bắt đầu một cuộc trò chuyện</span>
  <h2 id="inquiry-title"></h2>
  <p>Để lại lời nhắn về điều bạn đang tìm kiếm.</p>
  <form>
    <label for="contact-name">Tên của bạn</label>
    <input id="contact-name" name="name" autocomplete="name" required maxlength="100" placeholder="Nguyễn An">
    <label for="contact-email">Email</label>
    <input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="ban@email.com">
    <label for="contact-message">Bạn cần chúng tôi giúp gì?</label>
    <textarea id="contact-message" name="message" required maxlength="2000" placeholder="Chia sẻ một chút về nhu cầu của bạn…"></textarea>
    <button class="modal-submit" type="submit">Xem lời nhắn <span aria-hidden="true">↗</span></button>
  </form>
  <p class="modal-note">Đây là form trải nghiệm của thương hiệu giả định. Lời nhắn chỉ hiển thị trên máy của bạn, chưa được gửi đi.</p>
  <p class="modal-status" role="status" hidden></p>`;
document.body.append(dialog);
const form = dialog.querySelector('form');
const inquiryStatus = dialog.querySelector('.modal-status');
const title = dialog.querySelector('h2');
document.querySelectorAll('[data-inquiry]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!form || !inquiryStatus || !title) return;
    form.reset();
    form.hidden = false;
    if (inquiryStatus instanceof HTMLElement) inquiryStatus.hidden = true;
    title.textContent = button.getAttribute('data-inquiry');
    dialog.showModal();
  });
});
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !(inquiryStatus instanceof HTMLElement)) return;
  const fields = new FormData(form);
  inquiryStatus.textContent = `Cảm ơn ${fields.get('name')}! Lời nhắn mẫu của bạn: “${fields.get('message')}”. Thông tin này chưa được gửi đến doanh nghiệp.`;
  inquiryStatus.hidden = false;
  form.hidden = true;
});

const caseDialog = document.querySelector('#case-dialog');
document.querySelectorAll('[data-case]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!(caseDialog instanceof HTMLDialogElement)) return;
    const template = document.getElementById(button.getAttribute('data-case') || '');
    const content = caseDialog.querySelector('.case-content');
    if (!(template instanceof HTMLTemplateElement) || !content) return;
    content.replaceChildren(template.content.cloneNode(true));
    caseDialog.showModal();
  });
});
document.querySelectorAll('dialog').forEach((element) => {
  element.querySelector('.modal-close')?.addEventListener('click', () => element.close());
  element.addEventListener('click', (event) => {
    const bounds = element.getBoundingClientRect();
    if (event.target === element && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) element.close();
  });
});

const filters = document.querySelectorAll('[data-filter]');
filters.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-filter');
    filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
    document.querySelectorAll('[data-category]').forEach((product) => {
      if (product instanceof HTMLElement) product.hidden = category !== 'all' && product.dataset.category !== category;
    });
    const count = document.querySelector('#filter-status');
    if (count) count.textContent = `Đang hiển thị ${document.querySelectorAll('[data-category]:not([hidden])').length} sản phẩm.`;
  });
});

const orbit = document.querySelector('.orbit-stage');
if (orbit instanceof HTMLElement) {
  orbit.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = orbit.getBoundingClientRect();
    orbit.style.setProperty('--mx', `${(event.clientX - rect.left - rect.width / 2) * 0.035}px`);
    orbit.style.setProperty('--my', `${(event.clientY - rect.top - rect.height / 2) * 0.035}px`);
  });
  orbit.addEventListener('pointerleave', () => {
    orbit.style.setProperty('--mx', '0px');
    orbit.style.setProperty('--my', '0px');
  });
}
