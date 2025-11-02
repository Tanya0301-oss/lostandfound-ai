// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAqDG3Bo-Mt8YJpN3JU_uknn6x0VgmKZxk",
    authDomain: "lost-and-found-4710f.firebaseapp.com",
    projectId: "lost-and-found-4710f",
    storageBucket: "lost-and-found-4710f.appspot.com",
    messagingSenderId: "375395477865",
    appId: "1:375395477865:web:1ae3d7b4719741de9dfd5f8",
    measurementId: "G-PP6Y9G781U"
};

// Cloudinary Configuration
const cloudinaryConfig = {
    cloudName: 'dpwxvbpdx',
    uploadPreset: 'lostandfound'
};

// Initialize Firebase
let app, auth, db;
try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}
