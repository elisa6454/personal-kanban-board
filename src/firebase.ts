import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
//import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAaASDbVWzuHQs-vfvrT0Dnab-l6qIhuRk",
  authDomain: "personal-kanban-board-da4d3.firebaseapp.com",
  projectId: "personal-kanban-board-da4d3",
  storageBucket: "personal-kanban-board-da4d3.appspot.com",
  messagingSenderId: "683265552239",
  appId: "1:683265552239:web:b093a4b48387fbddd6029a",
  measurementId: "G-6E5RHFDYVV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// export const storage = getStorage(app);

export const db = getFirestore(app);
