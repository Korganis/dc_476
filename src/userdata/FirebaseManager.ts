// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, AuthProvider, setPersistence, browserLocalPersistence, User, Auth } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, doc, Firestore, CollectionReference, DocumentData } from 'firebase/firestore/lite';
import { Castle } from "./Castle";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

class FirebaseManager {
    private _collection: string = "userdata";
    private _creds: User | null = null;
    private _app: FirebaseApp = initializeApp(firebaseConfig);
    private _auth: Auth = getAuth();
    private _db: Firestore = getFirestore(this._app);
    private _col?: CollectionReference<DocumentData>;
    private _loaded: Promise<void> = new Promise<void>((resolve) => {
        this._auth.onAuthStateChanged((user) => {
            this._creds = user;
            if (user) {
                this._col = collection(this._db, this._collection);
            }
            resolve();
        });
    });

    public get creds(): User | null {
        return this._creds;
    }

    public get loaded(): Promise<void> {
        return this._loaded;
    }

    public constructor() {
        setPersistence(this._auth, browserLocalPersistence); // Store in browser local storage
    }

    public signOut(): void {
        this._auth.signOut();
    }

    public async authenticate(method: SignInMethod): Promise<void> {
        // Determine which sign in method to use
        let provider: AuthProvider;
        switch (method) {
            case 'google':
                provider = new (await import('firebase/auth')).GoogleAuthProvider;
                break;
            case 'facebook':
                provider = new (await import('firebase/auth')).FacebookAuthProvider;
                break;
            case 'twitter':
                provider = new (await import('firebase/auth')).TwitterAuthProvider;
                break;
            case 'github':
                provider = new (await import('firebase/auth')).GithubAuthProvider;
                break;
            default:
                throw new Error('Invalid sign in method');
        }

        // Check if user is signed in
        await this._loaded;

        // If they're not signed in, open a popup to sign in
        this._creds = this._creds || (await signInWithPopup(this._auth, provider)).user;
        this._col = collection(this._db!, this._collection);
    }

    public async get(id: string): Promise<Castle | null> {
        if (!this._creds) { throw new Error('Not authenticated'); }
        if (!this._col) { throw new Error('Collection not found'); }
        const snap = await getDocs(this._col);
        const data = snap.docs.find(doc => doc.id === id);
        return data ? (data.data() as Castle) : null;
    }

    public async set(id: string, data: Castle): Promise<void> {
        if (!this._creds) { throw new Error('Not authenticated'); }
        if (!this._col) { throw new Error('Collection not found'); }
        const temp = {};
        Object.assign(temp, data); // This converts our custom object into a plain object
        await setDoc(doc(this._col, this._creds.uid), temp);
    }
}

// Your web app's Firebase configuration
type SignInMethod = 'google' | 'facebook' | 'twitter' | 'github';
const firebaseConfig = {
    apiKey: "AIzaSyBGHKR2agjZ3zC16qBmCQWR1QIUVjL4H9g",
    authDomain: "root-array-282901.firebaseapp.com",
    projectId: "root-array-282901",
    storageBucket: "root-array-282901.appspot.com",
    messagingSenderId: "351491159906",
    appId: "1:351491159906:web:4c0d799a930065b5e3de3b"
};

export const firebaseManager = new FirebaseManager();