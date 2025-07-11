import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

window.SCHOOLZY_FIREBASE = {
  initializeApp,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getFirestore,
  setDoc,
  doc,
  getDoc
}; 