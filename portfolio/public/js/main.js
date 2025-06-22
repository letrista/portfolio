ScrollReveal().reveal('[data-sr]', {
  distance: '20px',
  duration: 600,
  easing: 'ease-out',
  origin: 'bottom',
  interval: 100
});

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

const bars = menuToggle.querySelectorAll('span');

function openMenu() {
  mobileMenu.classList.remove('translate-x-full');
  mobileMenu.classList.add('translate-x-0');

  overlay.classList.remove('opacity-0', 'pointer-events-none');
  overlay.classList.add('opacity-100', 'pointer-events-auto');

  bars[0].classList.add('rotate-45', 'translate-y-2');
  bars[1].classList.add('opacity-0');
  bars[2].classList.add('-rotate-45', '-translate-y-2');
}

function closeMenu() {
  mobileMenu.classList.add('translate-x-full');
  mobileMenu.classList.remove('translate-x-0');

  overlay.classList.add('opacity-0', 'pointer-events-none');
  overlay.classList.remove('opacity-100', 'pointer-events-auto');

  bars[0].classList.remove('rotate-45', 'translate-y-2');
  bars[1].classList.remove('opacity-0');
  bars[2].classList.remove('-rotate-45', '-translate-y-2');
}

menuToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('translate-x-0');
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay.addEventListener('click', closeMenu);

document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

function showNotification(message) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 4000);
}

const form = document.getElementById('formContato');

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    let timeInput = form.querySelector('input[name="time"]');
    if (!timeInput) {
      timeInput = document.createElement('input');
      timeInput.type = 'hidden';
      timeInput.name = 'time';
      form.appendChild(timeInput);
    }
    timeInput.value = dataHora;

    emailjs.sendForm('service_972x13d', 'template_pwwam4j', this)
      .then(() => {
        showNotification('Mensagem enviada com sucesso!');
        form.reset();
      }, (error) => {
        showNotification('Erro ao enviar. Tente novamente.');
        console.error('Erro:', error);
      });
  });
}

const postsContainer = document.getElementById('posts-container');

if (postsContainer) {
  import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js").then(({ initializeApp }) => {
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js").then(firestore => {
      const firebaseConfig = {
        apiKey: "AIzaSyBZb74v72iVlMHUnECMgoMDyfFKIzVeE68",
        authDomain: "letristadev.firebaseapp.com",
        projectId: "letristadev",
        storageBucket: "letristadev.firebasestorage.app",
        messagingSenderId: "337285038192",
        appId: "1:337285038192:web:9519a6b99451db33ce34b5"
      };

      const app = initializeApp(firebaseConfig);
      const db = firestore.getFirestore(app);

      function renderPostCard(id, post) {
        const a = document.createElement('a');
        a.href = `post.html?id=${id}`;
        a.className = 'group bg-neutral-800 rounded-2xl p-6 shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 block';

        a.innerHTML = `
                    <div class="space-y-3">
                        <h3 class="text-xl font-semibold mb-1">${post.title}</h3>
                        <p class="text-gray-400 text-sm leading-relaxed">${post.excerpt || excerptFromContent(post.content)}</p>
                        <p class="text-xs text-gray-500 pt-2 border-t border-neutral-700">Publicado em ${post.date}</p>
                    </div>
                `;
        return a;
      }

      function excerptFromContent(htmlContent, maxLen = 120) {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        const text = div.textContent || div.innerText || "";
        return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
      }

      const q = firestore.query(firestore.collection(db, "posts"), firestore.orderBy("date", "desc"));

      firestore.onSnapshot(q, (snapshot) => {
        postsContainer.innerHTML = '';
        snapshot.forEach(docSnap => {
          const post = docSnap.data();
          const postCard = renderPostCard(docSnap.id, post);
          postsContainer.appendChild(postCard);
        });
      });
    });
  });
}
