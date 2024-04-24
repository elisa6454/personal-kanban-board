// src/firebaseUtils.js
import { atom } from "recoil"; // Firebase settings file
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import {IBoard} from "./atoms";


// Initial data defining
const defaultToDos: IBoard[] = [
  {
    title: "To Do",
    id: 0,
    toDos: [],
  },
  {
    title: "Doing",
    id: 1,
    toDos: [],
  },
  {
    title: "Done",
    id: 2,
    toDos: [],
  },
];

export const toDoState = atom<IBoard[]>({
  key: "toDos",
  default: [], // load it from Firestore, initialize it with an empty array
  effects: [
    ({ setSelf, onSet, trigger }) => {
      const userId = auth.currentUser; // set or get the user ID appropriately
      const key = "trello-clone-to-dos";

      // Load initial data from Firestore
      if (trigger === "get") {
        loadDataFromFirestore(userId, key).then((loadedData) => {
          if (loadedData) {
            setSelf(loadedData);
          }
        });
      }

      // Save to Firestore every time the state changes
      onSet((newValue) => {
        saveDataToFirestore(userId, key, newValue);
      });
    },
  ],
});

// Store data in Firestore
export const saveDataToFirestore = async (userId: any, key: any, data: any) => {
  try {
    const dataString = JSON.stringify(data); // Serialize data as string
    await setDoc(doc(db, `users/${userId}/data`, key), { data: dataString });
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data: ", error);
  }
};

// Load data from Firestore (Modified)
export const loadDataFromFirestore = async (userId: any, key: any) => {
  try {
    const docRef = doc(db, `users/${userId}/data`, key);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dataString = docSnap.data().data; // stored string data
      return JSON.parse(dataString); // Deserialize string to object
    } else {
      console.log("No such document, inserting default data.");
      // If document does not exist, insert default data
      await saveDataToFirestore(userId, key, defaultToDos);
      return defaultToDos; // Return initial data
    }
  } catch (error) {
    console.error("Error loading or inserting data: ", error);
    return null;
  }
};
