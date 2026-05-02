// Codeovsky animations lightbox
(function () {
  'use strict';

  const modal = document.getElementById('videoModal');
  if (!modal) return;

  const frame = document.getElementById('videoModalFrame');
  const titleEl = document.getElementById('videoModalTitle');
  const clientEl = document.getElementById('videoModalClient');

  function openModal(videoUrl, title, client) {
    if (!videoUrl) return;

    // Detect whether it's an iframe-embeddable URL (YouTube/Vimeo) or a local video file
    const isIframe = /youtube\.com\/embed|player\.vimeo\.com|youtu\.be\//.test(videoUrl);
    const isLocalVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);

    let html = '';
    if (isIframe) {
      // Add autoplay parameter
      const sep = videoUrl.includes('?') ? '&' : '?';
      const url = videoUrl + sep + 'autoplay=1&rel=0';
      html = `<iframe src="${url}" frameborder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen></iframe>`;
    } else if (isLocalVideo) {
      html = `<video src="${videoUrl}" controls autoplay playsinline></video>`;
    } else {
      // Fallback — open in new tab
      window.open(videoUrl, '_blank', 'noopener');
      return;
    }

    frame.innerHTML = html;
    titleEl.textContent = title || '';
    clientEl.textContent = client || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    frame.innerHTML = '';   // stops playback
    document.body.style.overflow = '';
  }

  // Wire up triggers
  document.querySelectorAll('.site-animations-card[data-video]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(
        btn.getAttribute('data-video'),
        btn.getAttribute('data-title'),
        btn.getAttribute('data-client')
      );
    });
  });

  // Close on overlay or button click
  modal.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();