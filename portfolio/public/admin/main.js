import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBZb74v72iVlMHUnECMgoMDyfFKIzVeE68",
    authDomain: "letristadev.firebaseapp.com",
    projectId: "letristadev",
    storageBucket: "letristadev.firebasestorage.app",
    messagingSenderId: "337285038192",
    appId: "1:337285038192:web:9519a6b99451db33ce34b5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const allowedUID = "g5LGFeuFzHY94xYEIAQRaAmtsEB3";

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

const logoutBtn = document.getElementById('logout-btn');

const postForm = document.getElementById('post-form');
const postIdInput = document.getElementById('post-id');
const postTitleInput = document.getElementById('post-title');
const postDateInput = document.getElementById('post-date');
const postContentInput = document.getElementById('post-content');

const postsList = document.getElementById('posts-list');

let isEditing = false;

function showLogin(message = '') {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
    loginMessage.textContent = message;
}

function showAdmin() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    loginMessage.textContent = '';
}

onAuthStateChanged(auth, user => {
    console.log('Estado de autenticação mudou:', user);
    if (user && user.uid === allowedUID) {
        showAdmin();
        startPostsListener();
    } else {
        showLogin();
    }
});


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMessage.textContent = '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginMessage.textContent = 'Erro no login: ' + error.message;
    }
});


logoutBtn.addEventListener('click', () => {
    signOut(auth);
    clearPostsList();
    clearPostForm();
    isEditing = false;
});

function clearPostsList() {
    postsList.innerHTML = '';
}

function clearPostForm() {
    postIdInput.value = '';
    postTitleInput.value = '';
    postDateInput.value = '';
    postContentInput.value = '';
    isEditing = false;
    document.getElementById('cancel-edit-btn').hidden = true;
    document.getElementById('save-post-btn').textContent = 'Salvar';
}

function renderPostItem(id, data) {
    const div = document.createElement('div');
    div.className = "bg-gray-800 rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4";

    const info = document.createElement('div');
    info.className = "flex-grow";

    const titleEl = document.createElement('h3');
    titleEl.textContent = data.title;
    titleEl.className = "font-bold text-lg text-coffee";

    const dateEl = document.createElement('p');
    dateEl.textContent = data.date;
    dateEl.className = "text-sm text-gray-400";

    info.appendChild(titleEl);
    info.appendChild(dateEl);

    const actions = document.createElement('div');
    actions.className = "flex gap-2";

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = "px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 transition text-sm";
    editBtn.onclick = () => loadPostToForm(id, data);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.className = "px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition text-sm";
    deleteBtn.onclick = () => deletePost(id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(info);
    div.appendChild(actions);

    return div;
}

function loadPostToForm(id, data) {
    postIdInput.value = id;
    postTitleInput.value = data.title;
    postDateInput.value = data.date;
    postContentInput.value = data.content;
    isEditing = true;
    document.getElementById('cancel-edit-btn').hidden = false;
    document.getElementById('save-post-btn').textContent = 'Atualizar';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('cancel-edit-btn').addEventListener('click', e => {
    e.preventDefault();
    clearPostForm();
});

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = postTitleInput.value.trim();
    const date = postDateInput.value.trim();
    const content = postContentInput.value.trim();

    if (!title || !date || !content) {
        alert('Preencha todos os campos.');
        return;
    }

    try {
        if (isEditing) {
            const postRef = doc(db, "posts", postIdInput.value);
            await updateDoc(postRef, { title, date, content });
            alert('Post atualizado com sucesso!');
        } else {
            await addDoc(collection(db, "posts"), { title, date, content });
            alert('Post criado com sucesso!');
        }
        clearPostForm();
    } catch (error) {
        alert('Erro ao salvar post: ' + error.message);
    }
});

async function deletePost(id) {
    if (confirm('Tem certeza que deseja excluir este post?')) {
        try {
            await deleteDoc(doc(db, "posts", id));
            alert('Post excluído com sucesso!');
        } catch (error) {
            alert('Erro ao excluir post: ' + error.message);
        }
    }
}

let unsubscribePosts = null;
function startPostsListener() {
    if (unsubscribePosts) unsubscribePosts();

    const q = query(collection(db, "posts"), orderBy("date", "desc"));

    unsubscribePosts = onSnapshot(q, (querySnapshot) => {
        clearPostsList();
        querySnapshot.forEach(docSnap => {
            const postEl = renderPostItem(docSnap.id, docSnap.data());
            postsList.appendChild(postEl);
        });
    });
}
