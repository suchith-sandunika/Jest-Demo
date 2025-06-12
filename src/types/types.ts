interface user {
    name: string;
    email: string;
    age: number;
    dob: Date;
    password: string;
}

interface update {
    name: string;
    email: string;
    age: number;
    dob: Date;
}

interface editName {
    name: string;
}

interface editEmail {
    email: string;
}

interface editPassword {
    newPassword: string;
    oldPassword: string;
}

export { user, update, editName, editEmail, editPassword };