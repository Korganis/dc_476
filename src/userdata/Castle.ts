import { firebaseManager } from "./FirebaseManager";

/*
    This is a bit of a complicated one. Essentially, we have our player object, which
    is an entity wrapper around the Castle object. In order to save/retrieve the
    Castle, we store it in Firebase. We also have a FirebaseManager object, which
    synchronizes our Castle object with the Firebase database.

    In order to see if the user is logged in, we check await firebaseManager.loaded,
    then check if firebaseManager.creds is null. If it is, the main menu should
    prompt the user to sign in with firebaseManager.authenticate().

    If the user is signed in, we can simply call:
        Castle.prototype.get();
    to retrieve the Castle object. This will always return a Castle object, even if
    there is no Castle object stored in the database. This ensures that a new user
    will receive a new Castle object.

    To save the Castle object, we call:
        Castle.prototype.save();
    This will save the Castle object to the database.

    Neither of these functions perform any checks against firebaseManager's
    connection, so it's up to you to ensure that the user is signed in before
    calling these functions.

    In order to modify the Castle object, you must modify it both here and in
    Firebase, at:
    https://console.firebase.google.com/project/root-array-282901/firestore/data

*/

export class Castle {
    public level: number;
    public exp: number;
    public mana: number;
    public armor: number;
    public coins: number;
    public rubies: number;
    public health: number;
    public maxHealth: number;
    public lastLevel: number;

    constructor() {
        this.level = 1;
        this.exp = 0;
        this.mana = 0;
        this.armor = 0;
        this.coins = 0;
        this.rubies = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.lastLevel = 0;
    }

    async load() {
        Object.assign(this, await firebaseManager.get(firebaseManager.creds!.uid));
    }

    async save() {
        return firebaseManager.set(firebaseManager.creds!.uid, this);
    }
}